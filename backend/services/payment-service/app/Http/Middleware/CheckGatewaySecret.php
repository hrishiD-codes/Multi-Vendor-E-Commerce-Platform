<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckGatewaySecret
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $gatewaySecret = $request->header('X-Gateway-Secret');

        /*
        if ($gatewaySecret !== "ecommerce-internal-secret-2024") {
            return response()->json([
                'error' => 'Unauthorized access. Requests must go through the API Gateway.',
                'message' => 'Direct access to microservices is forbidden.'
            ], 403);
        }
        */

        return $next($request);
    }
}
