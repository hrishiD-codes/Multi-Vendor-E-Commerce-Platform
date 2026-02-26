<?php

namespace App\Http\Controllers\Payment;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\CreateIntentRequest;
use App\Http\Requests\Payment\ProcessCodRequest;
use App\Http\Requests\Payment\RefundRequest;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    private function resolveUserId(Request $request): ?int
    {
        $id = $request->header('X-User-Id');
        return $id ? (int) $id : null;
    }

    // ─── Stripe Payment Intent ──────────────────────────────────────────────────

    /**
     * POST /api/payments/intent
     * Create a Stripe PaymentIntent — returns client_secret for frontend use.
     */
    public function createIntent(CreateIntentRequest $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);

        $data = $this->paymentService->createStripeIntent(
            $request->validated()['order_id'],
            $userId ?? $request->validated()['user_id'] ?? 0,
            $request->validated()['amount'],
            $request->validated()['currency'] ?? 'usd',
        );

        return response()->json(['data' => $data], 201);
    }

    // ─── COD ───────────────────────────────────────────────────────────────────

    /**
     * POST /api/payments/cod
     * Record a Cash on Delivery payment for an order.
     */
    public function processCod(ProcessCodRequest $request): JsonResponse
    {
        $userId  = $this->resolveUserId($request);
        $payment = $this->paymentService->processCod(
            $request->validated()['order_id'],
            $userId ?? 0,
            $request->validated()['amount'],
        );

        return response()->json([
            'message' => 'COD payment recorded.',
            'data'    => $this->paymentService->formatPayment($payment),
        ], 201);
    }

    // ─── Admin ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/admin/payments
     * List all payments with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $payments = $this->paymentService->getAllPayments(
            $request->only(['status', 'gateway']),
            (int) $request->query('per_page', 15),
        );

        return response()->json([
            'data' => $payments->through(fn($p) => $this->paymentService->formatPayment($p)),
        ]);
    }

    /**
     * GET /api/payments/{id}
     * Get a single payment by ID.
     */
    public function show(int $id): JsonResponse
    {
        $payment = $this->paymentService->getPayment($id);

        return response()->json(['data' => $this->paymentService->formatPayment($payment)]);
    }

    /**
     * GET /api/payments/order/{orderId}
     * Get payment record for a specific order.
     */
    public function byOrder(int $orderId): JsonResponse
    {
        $payment = $this->paymentService->getPaymentByOrder($orderId);

        if (!$payment) {
            return response()->json(['data' => null], 404);
        }

        return response()->json(['data' => $this->paymentService->formatPayment($payment)]);
    }

    /**
     * POST /api/admin/payments/{id}/refund
     * Issue a refund (admin only).
     */
    public function refund(RefundRequest $request, int $id): JsonResponse
    {
        $payment = $this->paymentService->getPayment($id);
        $payment = $this->paymentService->refund($payment, $request->validated()['amount']);

        return response()->json([
            'message' => 'Refund processed.',
            'data'    => $this->paymentService->formatPayment($payment),
        ]);
    }
}
