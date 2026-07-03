<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'bakong' => [
        'api_url' => env('BAKONG_API_URL', 'https://api-bakong.nbc.gov.kh/'),
        'api_token' => env('BAKONG_API_TOKEN'),
        'api_email' => env('BAKONG_API_EMAIL'),
        'account_id' => env('BAKONG_ACCOUNT_ID', env('BAKONG_MERCHANT_ID', 'seanghav_tuon@bkrt')),
        'merchant_id' => env('BAKONG_MERCHANT_ID', 'MID-123456789'),
        'merchant_name' => env('BAKONG_MERCHANT_NAME', 'TOS TINH Store'),
        'merchant_city' => env('BAKONG_MERCHANT_CITY', 'Phnom Penh'),
        'bank_name' => env('BAKONG_BANK_NAME', 'Bakong'),
        'acquiring_bank' => env('BAKONG_ACQUIRING_BANK', env('BAKONG_BANK_NAME', 'Bakong')),
        'store_name' => env('BAKONG_STORE_NAME', 'TOS TINH MART'),
        'merchant_mobile' => env('BAKONG_MERCHANT_MOBILE', '077906536'),
        'terminal_label' => env('BAKONG_TERMINAL_LABEL', 'WebQR'),
        'tag99_00' => env('BAKONG_TAG99_00', '1780990033420'),
        'tag99_01' => env('BAKONG_TAG99_01', '1781076433420'),
        'secret' => env('BAKONG_SECRET_KEY', 'bakong_secret_passphrase_123'),
        'is_test' => env('BAKONG_IS_TEST', true),
    ],

    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'chat_id' => env('TELEGRAM_CHAT_ID'),
    ],

    'telegram_stock' => [
        'bot_token' => env('TELEGRAM_STOCK_BOT_TOKEN'),
        'chat_id' => env('TELEGRAM_STOCK_CHAT_ID'),
    ],

];
