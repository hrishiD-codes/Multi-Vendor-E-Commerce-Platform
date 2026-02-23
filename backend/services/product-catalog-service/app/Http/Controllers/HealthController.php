<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        return response()->json([
            'service' => 'product-catalog-service',
            'status'  => 'ok',
            'time'    => now()->toISOString(),
        ]);
    }
}
