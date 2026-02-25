<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('order_number')->unique();
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', [
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'refunded',
            ])->default('pending');

            // Shipping address (stored as JSON snapshot)
            $table->jsonb('shipping_address');
            // Billing address (stored as JSON snapshot)
            $table->jsonb('billing_address');

            $table->string('payment_status')->default('unpaid'); // unpaid | paid | refunded
            $table->string('payment_method')->nullable();        // stripe | cod | paypal
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
