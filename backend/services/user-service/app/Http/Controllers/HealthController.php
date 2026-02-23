<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    /**
     * GET /api/health
     * Simple health-check endpoint for Docker/K8s probes.
     */
    public function check(): JsonResponse
    {
        return response()->json([
            'service' => 'user-service',
            'status'  => 'ok',
            'time'    => now()->toISOString(),
        ]);
    }
}
