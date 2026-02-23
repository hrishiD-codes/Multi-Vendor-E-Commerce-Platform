<?php

use App\Http\Controllers\Category\CategoryController;
use App\Http\Controllers\HealthController;
use App\Http\Controllers\Inventory\InventoryController;
use App\Http\Controllers\Product\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Product Catalog Service
|--------------------------------------------------------------------------
*/

// Health check
Route::get('/health', [HealthController::class, 'check']);

// ─── Public Routes ─────────────────────────────────────────────────────────

// Products
Route::prefix('products')->group(function () {
    Route::get('/search',   [ProductController::class, 'search']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/',         [ProductController::class, 'index']);
    Route::get('/{id}',     [ProductController::class, 'show']);
});

// Categories
Route::prefix('categories')->group(function () {
    Route::get('/',     [CategoryController::class, 'index']);
    Route::get('/{id}', [CategoryController::class, 'show']);
});

// ─── Admin Routes (protected by token passed from API Gateway) ─────────────
// In production, the NGINX gateway validates the Sanctum token from the
// User Service. Here we expose the admin routes and trust the gateway header.

Route::prefix('admin')->group(function () {

    // Admin products
    Route::prefix('products')->group(function () {
        Route::get('/',      [ProductController::class, 'adminIndex']);
        Route::post('/',     [ProductController::class, 'store']);
        Route::put('/{id}',  [ProductController::class, 'update']);
        Route::delete('/{id}', [ProductController::class, 'destroy']);
    });

    // Admin categories
    Route::prefix('categories')->group(function () {
        Route::post('/',     [CategoryController::class, 'store']);
        Route::put('/{id}',  [CategoryController::class, 'update']);
        Route::delete('/{id}', [CategoryController::class, 'destroy']);
    });

    // Admin inventory
    Route::prefix('inventory')->group(function () {
        Route::get('/low-stock',          [InventoryController::class, 'lowStock']);
        Route::put('/products/{id}',      [InventoryController::class, 'update']);
    });
});

// Inventory update (also accessible as /api/products/{id}/inventory)
Route::put('/products/{id}/inventory', [InventoryController::class, 'update']);
