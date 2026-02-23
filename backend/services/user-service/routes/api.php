<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\User\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — User Service
|--------------------------------------------------------------------------
*/

// Health check (no auth required)
Route::get('/health', [HealthController::class, 'check']);

// -------------------------
// Public Auth Routes
// -------------------------
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [AuthController::class, 'resetPassword']);
});

// -------------------------
// Protected Routes (Sanctum)
// -------------------------
Route::middleware('auth:sanctum')->group(function () {

    // Auth actions
    Route::prefix('auth')->group(function () {
        Route::post('/logout',  [AuthController::class, 'logout']);
        Route::post('/refresh', [AuthController::class, 'refresh']);
        Route::get('/me',       [AuthController::class, 'me']);
    });

    // User profile
    Route::prefix('users')->group(function () {
        Route::get('/{id}',  [UserController::class, 'show']);
        Route::put('/{id}',  [UserController::class, 'update']);
    });

    // Admin — list all users
    Route::prefix('admin')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
    });
});
