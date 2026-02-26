<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\Payment\PaymentController;
use App\Http\Controllers\Webhook\WebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Payment Service
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', [HealthController::class, 'check']);

// ─── Payment Routes ─────────────────────────────────────────────────────────

Route::prefix('payments')->group(function () {
    // Create Stripe payment intent (returns client_secret for frontend)
    Route::post('/intent', [PaymentController::class, 'createIntent']);

    // Process COD payment
    Route::post('/cod', [PaymentController::class, 'processCod']);

    // Get payment by ID
    Route::get('/{id}', [PaymentController::class, 'show']);

    // Get payment for a specific order
    Route::get('/order/{orderId}', [PaymentController::class, 'byOrder']);
});

// ─── Webhook Routes ──────────────────────────────────────────────────────────

Route::prefix('webhooks')->group(function () {
    Route::post('/stripe', [WebhookController::class, 'stripe']);
});

// ─── Admin Routes ────────────────────────────────────────────────────────────

Route::prefix('admin')->group(function () {
    Route::get('/payments',               [PaymentController::class, 'index']);
    Route::post('/payments/{id}/refund',  [PaymentController::class, 'refund']);
});
