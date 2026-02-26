<?php

use App\Http\Controllers\HealthController;
use App\Http\Controllers\Notification\NotificationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Notification Service
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', [HealthController::class, 'check']);

// ─── Notification Send Endpoints ─────────────────────────────────────────────
Route::prefix('notifications')->group(function () {
    Route::post('/email', [NotificationController::class, 'sendEmail']);
    Route::post('/sms',   [NotificationController::class, 'sendSms']);
    Route::get('/history', [NotificationController::class, 'history']);

    // Template management
    Route::get('/templates',        [NotificationController::class, 'listTemplates']);
    Route::post('/templates',       [NotificationController::class, 'createTemplate']);
    Route::put('/templates/{id}',   [NotificationController::class, 'updateTemplate']);
    Route::delete('/templates/{id}',[NotificationController::class, 'deleteTemplate']);
});
