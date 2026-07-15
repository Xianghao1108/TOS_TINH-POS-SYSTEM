<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ sprintf('#INV-%05d', $invoice->id) }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #333333;
            font-size: 12px;
            line-height: 1.4;
        }
        
        .invoice-box {
            padding: 20px;
        }

        /* Layout Structure */
        .w-100 {
            width: 100%;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .bold {
            font-weight: bold;
        }

        /* Header block using table layout instead of flex */
        .header-table td {
            padding-bottom: 30px;
            vertical-align: top;
        }

        .store-logo {
            max-height: 50px;
            width: auto;
        }

        .store-name {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 5px;
        }

        .store-info-text {
            font-size: 11px;
            color: #64748b;
        }

        .invoice-title-block {
            text-align: right;
        }

        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
            margin: 0 0 5px 0;
        }

        .invoice-num {
            font-size: 15px;
            font-weight: bold;
            color: #059669;
            font-family: monospace;
        }

        /* Billing and Info Section */
        .info-table {
            margin-bottom: 25px;
            border-spacing: 15px 0;
            margin-left: -15px;
            margin-right: -15px;
        }

        .info-table td {
            width: 50%;
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 12px;
            border-radius: 8px;
            vertical-align: top;
        }

        .info-card-title {
            font-size: 10px;
            font-weight: bold;
            color: #94a3b8;
            text-transform: uppercase;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
        }

        .info-row {
            margin-bottom: 4px;
            font-size: 11px;
        }

        .info-label {
            color: #64748b;
            font-weight: 500;
        }

        .info-value {
            color: #1e293b;
            font-weight: 600;
            float: right;
        }

        /* Items Table */
        .items-table {
            border: 1px solid #e2e8f0;
            border-collapse: collapse;
            margin-bottom: 25px;
        }

        .items-table th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 10px;
            padding: 10px 12px;
            border-bottom: 2px solid #e2e8f0;
            text-align: left;
        }

        .items-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
            vertical-align: middle;
        }

        .items-table tr:last-child td {
            border-bottom: none;
        }

        .product-title {
            font-weight: bold;
            color: #0f172a;
            font-size: 12px;
        }

        .product-code {
            font-size: 9px;
            color: #94a3b8;
            font-family: monospace;
        }

        /* Summary section */
        .summary-table {
            width: 250px;
            float: right;
            margin-bottom: 30px;
        }

        .summary-table td {
            padding: 6px 0;
            font-size: 11px;
            color: #475569;
            border-bottom: 1px solid #f1f5f9;
        }

        .summary-table tr:last-child td {
            border-bottom: none;
        }

        .summary-table .grand-total-row td {
            border-top: 1.5px solid #cbd5e1;
            padding-top: 10px;
            font-size: 14px;
            font-weight: bold;
            color: #0f172a;
        }

        .summary-table .grand-total-row .total-val {
            color: #047857;
            font-size: 15px;
        }

        /* Clearfix */
        .clear {
            clear: both;
        }

        /* Footer greetings */
        .greetings-footer {
            margin-top: 50px;
            border-top: 1.5px dashed #cbd5e1;
            padding-top: 20px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
        }

        .greetings-footer .note {
            font-style: italic;
            color: #64748b;
            font-weight: bold;
            margin-top: 4px;
        }
    </style>
</head>
<body>

    @php
        $storeName = \App\Models\Setting::get('store_name', 'Tos Tinh Mart');
        $storeAddress = \App\Models\Setting::get('store_address', 'Phnom Penh, Cambodia');
        $storePhone = \App\Models\Setting::get('store_phone', '+855 12 345 678');
        $storeEmail = \App\Models\Setting::get('store_email', 'contact@tostinh.com');
        $receiptHeader = \App\Models\Setting::get('receipt_header', 'Thank you for shopping with us!');
        $receiptFooter = \App\Models\Setting::get('receipt_footer', 'Please come again!');
    @endphp

    <div class="invoice-box">
        
        <!-- Header Info Layout -->
        <table class="w-100 header-table">
            <tr>
                <td>
                    @if($logoExists)
                        <img src="{{ public_path('images/TOS TINH NOBG.png') }}" class="store-logo" alt="Logo">
                    @else
                        <div class="store-name">{{ $storeName }}</div>
                    @endif
                    <div class="store-info-text" style="margin-top: 6px;">
                        {{ $storeAddress }}<br>
                        Phone: {{ $storePhone }} &nbsp;|&nbsp; Email: {{ $storeEmail }}
                    </div>
                </td>
                <td class="invoice-title-block">
                    <div class="invoice-title">INVOICE</div>
                    <div class="invoice-num">{{ sprintf('#INV-%05d', $invoice->id) }}</div>
                </td>
            </tr>
        </table>

        <!-- Details Info Layout -->
        <table class="w-100 info-table">
            <tr>
                <!-- Billing metadata -->
                <td>
                    <div class="info-card-title">Billing Details</div>
                    <div class="info-row">
                        <span class="info-label">Date & Time:</span>
                        <span class="info-value">{{ $invoice->created_at->format('M d, Y h:i A') }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Payment Method:</span>
                        <span class="info-value">{{ $paymentLabel }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value">
                            @if($invoice->status === 1)
                                <span style="color: #047857; font-weight: bold; text-transform: uppercase;">Paid</span>
                            @else
                                <span style="color: #b45309; font-weight: bold; text-transform: uppercase;">Unpaid</span>
                            @endif
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Cashier:</span>
                        <span class="info-value">{{ $invoice->staff->name ?? 'Unknown' }}</span>
                    </div>
                </td>
                
                <!-- Customer info -->
                <td>
                    <div class="info-card-title">Customer Details</div>
                    <div class="info-row">
                        <span class="info-label">Name:</span>
                        <span class="info-value" style="font-weight: bold;">{{ $invoice->customer->name ?? 'Walk-in Customer' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Phone:</span>
                        <span class="info-value">{{ $invoice->customer->phone ?? 'N/A' }}</span>
                    </div>
                    @if(!empty($invoice->customer->email))
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">{{ $invoice->customer->email }}</span>
                        </div>
                    @endif
                </td>
            </tr>
        </table>

        <!-- Purchased items -->
        <table class="w-100 items-table">
            <thead>
                <tr>
                    <th style="width: 5%;">#</th>
                    <th>Product Details</th>
                    <th class="text-center" style="width: 10%;">Qty</th>
                    <th class="text-right" style="width: 20%;">Unit Price</th>
                    <th class="text-right" style="width: 20%;">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($consolidatedItems as $index => $item)
                    <tr>
                        <td class="text-center" style="border-right: 1px solid #f1f5f9;">{{ $index + 1 }}</td>
                        <td>
                            <div class="product-title">{{ $item['product_title'] }}</div>
                            @if(!empty($item['product_code']))
                                <div class="product-code">Barcode: {{ $item['product_code'] }}</div>
                            @endif
                        </td>
                        <td class="text-center bold">{{ $item['quantity'] }}</td>
                        <td class="text-right">{{ $currency }}{{ number_format($item['product_price'], 2) }}</td>
                        <td class="text-right bold">{{ $currency }}{{ number_format($item['subtotal'], 2) }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Summary list block -->
        <div class="w-100">
            <table class="summary-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right bold">{{ $currency }}{{ number_format($subtotal, 2) }}</td>
                </tr>
                @if($discount > 0)
                    <tr>
                        <td style="color: #059669;">Discount:</td>
                        <td class="text-right bold" style="color: #059669;">-{{ $currency }}{{ number_format($discount, 2) }}</td>
                    </tr>
                @endif
                @if($taxRate > 0)
                    <tr>
                        <td>VAT / Tax ({{ number_format($taxRate, 2) }}%):</td>
                        <td class="text-right bold">{{ $currency }}{{ number_format($taxAmount, 2) }}</td>
                    </tr>
                @endif
                <tr class="grand-total-row">
                    <td>Grand Total:</td>
                    <td class="text-right total-val">{{ $currency }}{{ number_format($grandTotal, 2) }}</td>
                </tr>
            </table>
            <div class="clear"></div>
        </div>

        <!-- Greetings footer messages -->
        @if(!empty($receiptHeader) || !empty($receiptFooter))
            <div class="greetings-footer">
                @if(!empty($receiptHeader))
                    <div>{{ $receiptHeader }}</div>
                @endif
                @if(!empty($receiptFooter))
                    <div class="note">{{ $receiptFooter }}</div>
                @endif
            </div>
        @endif

    </div>

</body>
</html>
