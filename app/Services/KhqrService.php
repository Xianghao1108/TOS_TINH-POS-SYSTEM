<?php

namespace App\Services;

class KhqrService
{
    /**
     * Format tag helper.
     */
    public function formatTag(string $tag, string $value): string
    {
        $formattedTag = str_pad($tag, 2, '0', STR_PAD_LEFT);
        $formattedLen = str_pad((string)strlen($value), 2, '0', STR_PAD_LEFT);
        return $formattedTag . $formattedLen . $value;
    }

    /**
     * Generate dynamic KHQR payload.
     * 
     * @param string $bakongAccountId
     * @param string $merchantName
     * @param string $merchantCity
     * @param string $orderNumber
     * @param float $amount
     * @param string $currency 'USD' or 'KHR'
     * @param int $expirySeconds Expiration time in seconds (default 600)
     * @return array [qr_string, md5_hash, qr_image_url, now_ms, expiry_ms]
     */
    public function generate(
        string $bakongAccountId,
        string $merchantName,
        string $merchantCity,
        string $orderNumber,
        float $amount,
        string $currency,
        int $expirySeconds = 600
    ): array {
        $currencyCode = $currency === 'KHR' ? '116' : '840';
        
        // Format amount
        if ($currency === 'KHR') {
            $formattedAmount = (string) round($amount);
        } else {
            $formattedAmount = sprintf('%.2f', $amount);
        }

        // Tags definition
        $parts = [];
        $parts[] = $this->formatTag('00', '01'); // Payload Format Indicator
        $parts[] = $this->formatTag('01', '12'); // Point of Initiation Method: 12 (Dynamic)
        
        // Merchant Account Info (Dynamically decide Tag 30 for Corporate or Tag 29 for Individual)
        $merchantId = config('services.bakong.merchant_id');
        $acquiringBank = config('services.bakong.acquiring_bank');

        if (!empty($merchantId) && !empty($acquiringBank) && $merchantId !== 'MID-123456789') {
            // Corporate Merchant Info (Tag 30)
            $subtag00 = $this->formatTag('00', $bakongAccountId);
            $subtag01 = $this->formatTag('01', $merchantId);
            $subtag02 = $this->formatTag('02', $acquiringBank);
            $parts[] = $this->formatTag('30', $subtag00 . $subtag01 . $subtag02);
        } else {
            // Individual Merchant Info (Tag 29)
            $subtag00 = $this->formatTag('00', $bakongAccountId);
            $parts[] = $this->formatTag('29', $subtag00);
        }
        
        $parts[] = $this->formatTag('52', '5999'); // Merchant Category Code
        $parts[] = $this->formatTag('53', $currencyCode); // Transaction Currency
        $parts[] = $this->formatTag('54', $formattedAmount); // Transaction Amount
        $parts[] = $this->formatTag('58', 'KH'); // Country Code
        $parts[] = $this->formatTag('59', $merchantName);
        $parts[] = $this->formatTag('60', $merchantCity);
        
        // Additional Data (Subtag 01 contains order_number, subtag 02 is mobile, subtag 03 is store name, subtag 07 is terminal label)
        $storeNameVal = config('services.bakong.store_name', 'TOS TINH MART');
        $mobileVal = config('services.bakong.merchant_mobile', '077906536');
        $terminalVal = config('services.bakong.terminal_label', 'WebQR');

        $subtag01 = $this->formatTag('01', $orderNumber);
        $subtag02 = $this->formatTag('02', $mobileVal);
        $subtag03 = $this->formatTag('03', $storeNameVal);
        $subtag07 = $this->formatTag('07', $terminalVal);

        $parts[] = $this->formatTag('62', $subtag01 . $subtag02 . $subtag03 . $subtag07);
        
        // Timestamp Data
        $nowMs = round(microtime(true) * 1000);
        $expiryMs = $nowMs + ($expirySeconds * 1000);
        $subtag00_time = $this->formatTag('00', (string) $nowMs);
        $subtag01_time = $this->formatTag('01', (string) $expiryMs);
        $parts[] = $this->formatTag('99', $subtag00_time . $subtag01_time);
        
        // Combine everything up to Tag 6304
        $partialPayload = implode('', $parts) . '6304';
        
        // Calculate CRC16-CCITT False
        $crc = $this->crc16CcittFalse($partialPayload);
        
        $finalQrString = implode('', $parts) . $this->formatTag('63', $crc);
        
        $md5Hash = md5($finalQrString);
        
        $qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($finalQrString);

        return [
            'qr_string' => $finalQrString,
            'md5_hash' => $md5Hash,
            'qr_image_url' => $qrImageUrl,
            'now_ms' => $nowMs,
            'expiry_ms' => $expiryMs,
        ];
    }

    /**
     * Retrieve access token from Bakong Open API (cached for 30 minutes)
     */
    public function getAccessToken(): ?string
    {
        $apiUrl = config('services.bakong.api_url');
        $apiEmail = config('services.bakong.api_email');

        if (!$apiUrl || !$apiEmail) {
            \Illuminate\Support\Facades\Log::warning('Bakong renew_token skipped: missing api_url or api_email config');
            return null;
        }

        $apiUrl = rtrim($apiUrl, '/') . '/';

        return \Illuminate\Support\Facades\Cache::remember('bakong_access_token', 1800, function () use ($apiUrl, $apiEmail) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(5)->post($apiUrl . 'v1/renew_token', [
                    'email' => $apiEmail
                ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $token = $data['data']['token'] ?? $data['token'] ?? $data['access_token'] ?? null;

                    if (!empty($token) && (int)($data['responseCode'] ?? 0) === 0) {
                        return $token;
                    }

                    \Illuminate\Support\Facades\Log::error('Bakong renew_token returned an application-level error', [
                        'response_code' => $data['responseCode'] ?? null,
                        'error_code' => $data['errorCode'] ?? null,
                        'response_message' => $data['responseMessage'] ?? null,
                        'body' => $data,
                    ]);
                    return null;
                }

                \Illuminate\Support\Facades\Log::error('Bakong renew_token failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Bakong renew_token exception', ['message' => $e->getMessage()]);
            }

            return null;
        });
    }

    public function checkTransaction(string $md5Hash): ?array
    {
        $apiUrl = config('services.bakong.api_url');
        $apiToken = config('services.bakong.api_token') ?: $this->getAccessToken();

        if (!$apiUrl || !$apiToken) {
            \Illuminate\Support\Facades\Log::warning('Bakong verification skipped: No API url or access token available');
            return [
                'error' => 'bakong_auth_failed',
                'message' => 'Bakong authentication is not available. Verify the production email/token configuration.'
            ];
        }

        $apiUrl = rtrim($apiUrl, '/') . '/';
        $endpoint = $apiUrl . 'v1/check_transaction_by_md5';

        $attempts = 0;
        while ($attempts < 2) {
            try {
                $response = \Illuminate\Support\Facades\Http::withoutVerifying()->timeout(5)->withHeaders([
                    'Authorization' => 'Bearer ' . $apiToken,
                    'Content-Type' => 'application/json',
                ])->post($endpoint, [
                    'md5' => $md5Hash,
                ]);

                if ($response->successful()) {
                    return $response->json();
                }

                if ($response->status() === 401 && $attempts === 0) {
                    \Illuminate\Support\Facades\Log::warning('Bakong token returned 401 Unauthorized. Fetching a fresh dynamic token...');
                    \Illuminate\Support\Facades\Cache::forget('bakong_access_token');
                    $apiToken = $this->getAccessToken();
                    if (!$apiToken) {
                        \Illuminate\Support\Facades\Log::warning('Bakong token refresh failed after 401 Unauthorized');
                        return [
                            'error' => 'bakong_auth_failed',
                            'message' => 'Bakong authentication failed while refreshing the access token.'
                        ];
                    }
                    $attempts++;
                    continue;
                }

                \Illuminate\Support\Facades\Log::warning('Bakong check_transaction_by_md5 response unsuccessful', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Bakong verification failed: ' . $e->getMessage());
            }
            break;
        }

        return null;
        return [
            'error' => 'bakong_verification_unavailable',
            'message' => 'Bakong verification could not be completed right now.'
        ];
    }

    /**
     * Calculate CRC16-CCITT False checksum.
     */
    private function crc16CcittFalse(string $data): string
    {
        $crc = 0xFFFF;
        $length = strlen($data);
        for ($i = 0; $i < $length; $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                if ($crc & 0x8000) {
                    $crc = (($crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }
        return sprintf('%04X', $crc);
    }
}
