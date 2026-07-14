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
        Schema::table('payments', function (Blueprint $table) {
            // Drop regular index on khqr_md5 if it exists, and make it unique
            $table->unique('khqr_md5');
            
            // Add unique constraint on transaction_id (allowing multiple nulls)
            $table->unique('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropUnique(['khqr_md5']);
            $table->dropUnique(['transaction_id']);
        });
    }
};
