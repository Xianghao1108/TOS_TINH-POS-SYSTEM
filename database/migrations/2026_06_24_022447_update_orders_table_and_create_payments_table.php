<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update orders table
        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_number')->unique()->after('id')->nullable();
            $table->decimal('total_amount', 15, 2)->after('total')->nullable();
            $table->string('currency', 3)->default('USD')->after('total_amount');
            $table->string('status')->default('pending')->after('currency'); // pending, paid, failed, expired
        });

        // 2. Create payments table
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('khqr_md5')->nullable()->index();
            $table->string('payment_status')->default('pending'); // pending, paid, failed
            $table->string('transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['order_number', 'total_amount', 'currency', 'status']);
        });
    }
};
