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
        Schema::create('pos_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number')->unique();
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade');
            $table->decimal('total_amount', 15, 2);
            $table->string('payment_method'); // cash, aba_qr, etc.
            $table->string('status')->default('pending'); // pending, paid, failed, refunded
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pos_invoices');
    }
};
