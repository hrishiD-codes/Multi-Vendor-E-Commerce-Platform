<?php

use App\Http\Controllers\Cart\CartController;
use App\Http\Controllers\HealthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Shopping Cart Service
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', [HealthController::class, 'check']);

// Cart routes
// Auth resolution is done via X-User-Id header (set by NGINX gateway)
// or ?session_id query param (for guest carts)
Route::prefix('cart')->group(function () {
    Route::get('/',              [CartController::class, 'show']);
    Route::post('/items',        [CartController::class, 'addItem']);
    Route::put('/items/{id}',    [CartController::class, 'updateItem']);
    Route::delete('/items/{id}', [CartController::class, 'removeItem']);
    Route::delete('/',           [CartController::class, 'clearCart']);
    Route::post('/merge',        [CartController::class, 'mergeCart']);
});
