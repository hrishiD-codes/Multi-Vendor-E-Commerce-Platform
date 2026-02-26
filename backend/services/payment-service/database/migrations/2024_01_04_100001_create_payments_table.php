<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_id')->index();
            $table->unsignedBigInteger('user_id')->index();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 10)->default('USD');
            $table->string('payment_method');       // stripe | paypal | cod
            $table->string('gateway')->nullable();  // stripe | paypal
            $table->string('transaction_id')->nullable()->unique(); // gateway txn ID
            $table->string('payment_intent_id')->nullable();       // Stripe PI id
            $table->enum('status', [
                'pending',
                'processing',
                'succeeded',
                'failed',
                'refunded',
                'partially_refunded',
                'cancelled',
            ])->default('pending');
            $table->decimal('refunded_amount', 10, 2)->default(0);
            $table->text('failure_reason')->nullable();
            $table->jsonb('metadata')->nullable(); // extra gateway-specific data
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
