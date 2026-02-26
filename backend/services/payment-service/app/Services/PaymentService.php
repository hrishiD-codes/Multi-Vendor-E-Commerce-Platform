<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\PaymentLog;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    // ─── Payment Intent (Stripe) ────────────────────────────────────────────────

    /**
     * Create a Stripe PaymentIntent and return the client_secret.
     * The frontend uses this to render the Stripe Elements UI.
     */
    public function createStripeIntent(int $orderId, int $userId, float $amount, string $currency = 'usd'): array
    {
        // Create a pending payment record first
        $payment = Payment::create([
            'order_id'       => $orderId,
            'user_id'        => $userId,
            'amount'         => $amount,
            'currency'       => strtoupper($currency),
            'payment_method' => 'stripe',
            'gateway'        => 'stripe',
            'status'         => 'pending',
        ]);

        try {
            $response = Http::withToken(config('services.stripe.secret'))
                ->post('https://api.stripe.com/v1/payment_intents', [
                    'amount'   => (int) ($amount * 100),   // Stripe uses cents
                    'currency' => strtolower($currency),
                    'metadata' => [
                        'order_id'   => $orderId,
                        'payment_id' => $payment->id,
                    ],
                ]);

            if ($response->failed()) {
                $this->logEvent($payment, 'intent.failed', 'stripe', $response->json());
                abort(502, 'Failed to create payment intent with Stripe.');
            }

            $intent = $response->json();

            $payment->update([
                'payment_intent_id' => $intent['id'],
                'status'            => 'processing',
            ]);

            $this->logEvent($payment, 'intent.created', 'stripe', $intent);

            return [
                'payment_id'    => $payment->id,
                'client_secret' => $intent['client_secret'],
                'amount'        => $amount,
                'currency'      => strtoupper($currency),
            ];

        } catch (\Exception $e) {
            $payment->update(['status' => 'failed', 'failure_reason' => $e->getMessage()]);
            Log::error('Stripe intent error: ' . $e->getMessage());
            abort(502, 'Payment gateway error.');
        }
    }

    // ─── COD (Cash on Delivery) ─────────────────────────────────────────────────

    /**
     * Record a COD payment. No gateway call needed — mark as pending until delivery.
     */
    public function processCod(int $orderId, int $userId, float $amount): Payment
    {
        $payment = Payment::create([
            'order_id'       => $orderId,
            'user_id'        => $userId,
            'amount'         => $amount,
            'currency'       => 'USD',
            'payment_method' => 'cod',
            'gateway'        => null,
            'status'         => 'pending',
        ]);

        $this->logEvent($payment, 'cod.recorded', 'system', ['order_id' => $orderId]);

        // Notify order service to confirm the order
        $this->notifyOrderService($orderId, 'cod');

        return $payment;
    }

    // ─── Confirm (after Stripe webhook) ────────────────────────────────────────

    /**
     * Confirm a payment once Stripe webhook fires payment_intent.succeeded.
     */
    public function confirmStripePayment(string $paymentIntentId, array $stripeEvent): ?Payment
    {
        $payment = Payment::where('payment_intent_id', $paymentIntentId)->first();

        if (!$payment) {
            Log::warning("No payment found for intent: {$paymentIntentId}");
            return null;
        }

        $chargeId = $stripeEvent['charges']['data'][0]['id'] ?? null;

        $payment->update([
            'status'         => 'succeeded',
            'transaction_id' => $chargeId,
            'metadata'       => $stripeEvent,
        ]);

        $this->logEvent($payment, 'payment.succeeded', 'stripe', $stripeEvent);

        // Notify order service to mark as paid
        $this->notifyOrderService($payment->order_id, 'stripe');

        return $payment;
    }

    // ─── Refund ─────────────────────────────────────────────────────────────────

    /**
     * Issue a full or partial refund via Stripe.
     */
    public function refund(Payment $payment, float $refundAmount): Payment
    {
        if (!$payment->isRefundable()) {
            abort(422, 'This payment is not eligible for a refund.');
        }

        $maxRefund = $payment->remainingRefundable();
        if ($refundAmount > $maxRefund) {
            abort(422, "Maximum refundable amount is \${$maxRefund}.");
        }

        try {
            $response = Http::withToken(config('services.stripe.secret'))
                ->post('https://api.stripe.com/v1/refunds', [
                    'charge' => $payment->transaction_id,
                    'amount' => (int) ($refundAmount * 100),
                ]);

            if ($response->failed()) {
                $this->logEvent($payment, 'refund.failed', 'stripe', $response->json());
                abort(502, 'Refund failed via Stripe.');
            }

            $refundData = $response->json();
            $newRefunded  = $payment->refunded_amount + $refundAmount;
            $newStatus    = $newRefunded >= $payment->amount ? 'refunded' : 'partially_refunded';

            $payment->update([
                'refunded_amount' => $newRefunded,
                'status'          => $newStatus,
            ]);

            $this->logEvent($payment, 'refund.created', 'stripe', $refundData);

        } catch (\Exception $e) {
            Log::error('Refund error: ' . $e->getMessage());
            abort(502, 'Payment gateway error during refund.');
        }

        return $payment->fresh('logs');
    }

    // ─── Retrieval ──────────────────────────────────────────────────────────────

    public function getPayment(int $id): Payment
    {
        return Payment::with('logs')->findOrFail($id);
    }

    public function getPaymentByOrder(int $orderId): ?Payment
    {
        return Payment::with('logs')->where('order_id', $orderId)->latest()->first();
    }

    public function getAllPayments(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Payment::with('logs')->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['gateway'])) {
            $query->where('gateway', $filters['gateway']);
        }

        return $query->paginate($perPage);
    }

    // ─── Formatting ─────────────────────────────────────────────────────────────

    public function formatPayment(Payment $payment): array
    {
        $payment->loadMissing('logs');

        return [
            'id'                => $payment->id,
            'order_id'          => $payment->order_id,
            'user_id'           => $payment->user_id,
            'amount'            => (float) $payment->amount,
            'currency'          => $payment->currency,
            'payment_method'    => $payment->payment_method,
            'gateway'           => $payment->gateway,
            'transaction_id'    => $payment->transaction_id,
            'payment_intent_id' => $payment->payment_intent_id,
            'status'            => $payment->status,
            'refunded_amount'   => (float) $payment->refunded_amount,
            'is_refundable'     => $payment->isRefundable(),
            'failure_reason'    => $payment->failure_reason,
            'created_at'        => $payment->created_at,
            'updated_at'        => $payment->updated_at,
            'logs'              => $payment->logs->map(fn($l) => [
                'event'  => $l->event_type,
                'source' => $l->source,
                'at'     => $l->created_at,
            ])->values(),
        ];
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private function logEvent(Payment $payment, string $event, string $source, array $payload): void
    {
        PaymentLog::create([
            'payment_id' => $payment->id,
            'event_type' => $event,
            'source'     => $source,
            'payload'    => $payload,
        ]);
    }

    /**
     * Call the Order Service to mark an order as paid (best-effort).
     */
    private function notifyOrderService(int $orderId, string $method): void
    {
        try {
            Http::post(config('services.order.url') . "/api/internal/orders/{$orderId}/paid", [
                'payment_method' => $method,
            ]);
        } catch (\Exception $e) {
            Log::warning("Failed to notify order service for order #{$orderId}: " . $e->getMessage());
        }
    }
}
