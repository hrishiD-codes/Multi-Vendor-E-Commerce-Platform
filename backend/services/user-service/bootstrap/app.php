<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->use([
            // \Illuminate\Http\Middleware\HandleCors::class,
            \App\Http\Middleware\CheckGatewaySecret::class,
        ]);
        // statefulApi() removed — this API uses Bearer token auth (Sanctum tokens),
        // not cookie/session SPA auth. statefulApi() was enabling CSRF which caused 419.
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();

