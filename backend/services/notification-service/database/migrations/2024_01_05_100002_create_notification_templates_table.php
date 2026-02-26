<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g. order_placed, payment_confirmed
            $table->enum('type', ['email', 'sms', 'both'])->default('email');
            $table->string('subject')->nullable(); // email subject with {{variable}} support
            $table->text('body');                  // template body with {{variable}} placeholders
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
