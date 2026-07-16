<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class ReportApiController extends Controller
{
    /**
     * Trigger the daily sales report summary command manually.
     */
    public function triggerNow(): JsonResponse
    {
        try {
            // Programmatically call the Artisan command with the --manual option
            $exitCode = Artisan::call('sales:send-report', ['--manual' => true]);
            $output = trim(Artisan::output());

            if ($exitCode === 0) {
                return response()->json([
                    'success' => true,
                    'message' => 'Daily sales report sent to Telegram successfully.',
                ], 200);
            }

            return response()->json([
                'success' => false,
                'message' => !empty($output) ? $output : 'Failed to send sales report. Check system logs for details.',
            ], 400);
        } catch (\Exception $e) {
            Log::error('Manual trigger of sales report failed. Exception: '.$e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred: '.$e->getMessage(),
            ], 500);
        }
    }
}
