<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    /**
     * POST /api/webhooks/stripe
     * Handles Stripe webhook events.
     *
     * Stripe signs every webhook with a signature header. In production,
     * validate using \Stripe\Webhook::constructEvent() with STRIPE_WEBHOOK_SECRET.
     */
    public function stripe(Request $request): JsonResponse
    {
        $payload   = $request->all();
        $eventType = $payload['type'] ?? null;

        Log::info("Stripe webhook received: {$eventType}");

        match ($eventType) {
            'payment_intent.succeeded' => $this->handleIntentSucceeded($payload['data']['object']),
            'payment_intent.payment_failed' => $this->handleIntentFailed($payload['data']['object']),
            default => Log::info("Unhandled Stripe event: {$eventType}"),
        };

        // Always return 200 to Stripe so it stops retrying
        return response()->json(['received' => true]);
    }

    // ─── Private Handlers ───────────────────────────────────────────────────────

    private function handleIntentSucceeded(array $intent): void
    {
        try {
            $payment = $this->paymentService->confirmStripePayment($intent['id'], $intent);
            if ($payment) {
                Log::info("Payment #{$payment->id} confirmed for order #{$payment->order_id}.");
            }
        } catch (\Exception $e) {
            Log::error("Error handling payment_intent.succeeded: " . $e->getMessage());
        }
    }

    private function handleIntentFailed(array $intent): void
    {
        try {
            \App\Models\Payment::where('payment_intent_id', $intent['id'])
                ->update([
                    'status'         => 'failed',
                    'failure_reason' => $intent['last_payment_error']['message'] ?? 'Unknown failure',
                ]);
        } catch (\Exception $e) {
            Log::error("Error handling payment_intent.payment_failed: " . $e->getMessage());
        }
    }
}
