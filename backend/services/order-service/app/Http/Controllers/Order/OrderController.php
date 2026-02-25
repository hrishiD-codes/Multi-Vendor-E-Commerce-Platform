<?php

namespace App\Http\Controllers\Order;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateStatusRequest;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService) {}

    // ─── Helper ────────────────────────────────────────────────────────────────

    /**
     * Resolve caller's user ID from the X-User-Id header (set by API Gateway).
     */
    private function resolveUserId(Request $request): ?int
    {
        $id = $request->header('X-User-Id');
        return $id ? (int) $id : null;
    }

    // ─── Customer Endpoints ────────────────────────────────────────────────────

    /**
     * POST /api/orders
     * Create a new order from cart contents.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Prefer X-User-Id header over body for security
        $userId = $this->resolveUserId($request);
        if ($userId) {
            $data['user_id'] = $userId;
        }

        $order = $this->orderService->createOrder($data);

        return response()->json([
            'message' => 'Order placed successfully.',
            'data'    => $this->orderService->formatOrder($order),
        ], 201);
    }

    /**
     * GET /api/orders
     * List authenticated user's orders (paginated).
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $this->resolveUserId($request);

        if (!$userId) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $orders = $this->orderService->getUserOrders($userId, (int) $request->query('per_page', 10));

        return response()->json([
            'data' => $orders->through(fn($o) => $this->orderService->formatOrder($o)),
        ]);
    }

    /**
     * GET /api/orders/{id}
     * Get a specific order (must belong to the user, or admin).
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        $order  = $this->orderService->getOrder($id, $userId);

        return response()->json(['data' => $this->orderService->formatOrder($order)]);
    }

    /**
     * POST /api/orders/{id}/cancel
     * Cancel an order (only if pending or confirmed).
     */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $userId = $this->resolveUserId($request);
        $order  = $this->orderService->getOrder($id, $userId);
        $order  = $this->orderService->cancelOrder($order, $userId);

        return response()->json([
            'message' => 'Order cancelled.',
            'data'    => $this->orderService->formatOrder($order),
        ]);
    }

    // ─── Admin Endpoints ───────────────────────────────────────────────────────

    /**
     * GET /api/admin/orders
     * List all orders with optional status/search filters.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $orders = $this->orderService->getAllOrders(
            $request->only(['status', 'payment_status', 'search']),
            (int) $request->query('per_page', 15),
        );

        return response()->json([
            'data' => $orders->through(fn($o) => $this->orderService->formatOrder($o)),
        ]);
    }

    /**
     * PUT /api/admin/orders/{id}/status
     * Update order status (admin only).
     */
    public function updateStatus(UpdateStatusRequest $request, int $id): JsonResponse
    {
        $adminId = $this->resolveUserId($request);
        $order   = $this->orderService->getOrder($id);
        $order   = $this->orderService->updateStatus(
            $order,
            $request->validated()['status'],
            $request->validated()['note'] ?? null,
            $adminId,
        );

        return response()->json([
            'message' => 'Order status updated.',
            'data'    => $this->orderService->formatOrder($order),
        ]);
    }
}
