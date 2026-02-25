<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\Order\OrderController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Order Service
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', [HealthController::class, 'check']);

// ─── Customer Routes ────────────────────────────────────────────────────────
// Identity resolved via X-User-Id header (set by NGINX API Gateway)

Route::prefix('orders')->group(function () {
    Route::post('/',           [OrderController::class, 'store']);
    Route::get('/',            [OrderController::class, 'index']);
    Route::get('/{id}',        [OrderController::class, 'show']);
    Route::post('/{id}/cancel',[OrderController::class, 'cancel']);
});

// ─── Admin Routes ───────────────────────────────────────────────────────────

Route::prefix('admin')->group(function () {
    Route::get('/orders',               [OrderController::class, 'adminIndex']);
    Route::put('/orders/{id}/status',   [OrderController::class, 'updateStatus']);
});
