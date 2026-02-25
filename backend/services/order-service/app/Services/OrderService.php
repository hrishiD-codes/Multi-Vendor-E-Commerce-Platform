<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use Illuminate\Pagination\LengthAwarePaginator;

class OrderService
{
    // ─── Order Creation ─────────────────────────────────────────────────────────

    /**
     * Create a new order from cart item data.
     * Expected $data shape:
     * {
     *   user_id, items: [{product_id, product_name, product_image, price, quantity}],
     *   shipping_address: {...}, billing_address: {...},
     *   payment_method? (default: cod), notes?
     * }
     */
    public function createOrder(array $data): Order
    {
        // Calculate total from items
        $items = $data['items'];
        $total = collect($items)->sum(fn($item) => $item['price'] * $item['quantity']);

        $order = Order::create([
            'user_id'          => $data['user_id'],
            'order_number'     => Order::generateOrderNumber(),
            'total_amount'     => $total,
            'status'           => 'pending',
            'shipping_address' => $data['shipping_address'],
            'billing_address'  => $data['billing_address'] ?? $data['shipping_address'],
            'payment_status'   => 'unpaid',
            'payment_method'   => $data['payment_method'] ?? 'cod',
            'notes'            => $data['notes'] ?? null,
        ]);

        // Create order items
        foreach ($items as $item) {
            OrderItem::create([
                'order_id'      => $order->id,
                'product_id'    => $item['product_id'],
                'product_name'  => $item['product_name'],
                'product_image' => $item['product_image'] ?? null,
                'price'         => $item['price'],
                'quantity'      => $item['quantity'],
                'subtotal'      => $item['price'] * $item['quantity'],
            ]);
        }

        // Record initial status
        $this->recordStatusHistory($order, 'pending', 'Order created', $data['user_id']);

        return $order->load('items', 'statusHistory');
    }

    // ─── Retrieval ──────────────────────────────────────────────────────────────

    /**
     * Get paginated orders for a specific user.
     */
    public function getUserOrders(int $userId, int $perPage = 10): LengthAwarePaginator
    {
        return Order::where('user_id', $userId)
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Get a single order — also validates it belongs to the given user (or admin).
     */
    public function getOrder(int $orderId, ?int $userId = null): Order
    {
        $query = Order::with('items', 'statusHistory');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        return $query->findOrFail($orderId);
    }

    /**
     * Get all orders (admin) with filters.
     */
    public function getAllOrders(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::with('items')->orderByDesc('created_at');

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('order_number', 'ilike', '%' . $filters['search'] . '%');
            });
        }

        return $query->paginate($perPage);
    }

    // ─── Status Management ──────────────────────────────────────────────────────

    /**
     * Update order status (admin).
     */
    public function updateStatus(Order $order, string $newStatus, ?string $note = null, ?int $changedBy = null): Order
    {
        $order->update(['status' => $newStatus]);
        $this->recordStatusHistory($order, $newStatus, $note, $changedBy);

        return $order->fresh(['items', 'statusHistory']);
    }

    /**
     * Cancel an order (customer or admin).
     */
    public function cancelOrder(Order $order, ?int $cancelledBy = null): Order
    {
        if (!$order->isCancellable()) {
            abort(422, "Order cannot be cancelled. Current status: {$order->status}.");
        }

        $order->update(['status' => 'cancelled']);
        $this->recordStatusHistory($order, 'cancelled', 'Order cancelled by ' . ($cancelledBy ? 'customer' : 'system'), $cancelledBy);

        return $order->fresh(['items', 'statusHistory']);
    }

    /**
     * Mark order payment as paid (called by Payment Service / webhook).
     */
    public function markAsPaid(Order $order, string $method): Order
    {
        $order->update([
            'payment_status' => 'paid',
            'payment_method' => $method,
            'status'         => 'confirmed',
        ]);

        $this->recordStatusHistory($order, 'confirmed', 'Payment received via ' . $method, null);

        return $order->fresh(['items', 'statusHistory']);
    }

    // ─── Private Helpers ────────────────────────────────────────────────────────

    private function recordStatusHistory(Order $order, string $status, ?string $note, ?int $changedBy): void
    {
        OrderStatusHistory::create([
            'order_id'   => $order->id,
            'status'     => $status,
            'note'       => $note,
            'changed_by' => $changedBy,
        ]);
    }

    // ─── Formatting ─────────────────────────────────────────────────────────────

    public function formatOrder(Order $order): array
    {
        $order->loadMissing('items', 'statusHistory');

        return [
            'id'               => $order->id,
            'order_number'     => $order->order_number,
            'user_id'          => $order->user_id,
            'status'           => $order->status,
            'payment_status'   => $order->payment_status,
            'payment_method'   => $order->payment_method,
            'total_amount'     => (float) $order->total_amount,
            'shipping_address' => $order->shipping_address,
            'billing_address'  => $order->billing_address,
            'notes'            => $order->notes,
            'is_cancellable'   => $order->isCancellable(),
            'items'            => $order->items->map(fn($i) => [
                'id'            => $i->id,
                'product_id'    => $i->product_id,
                'product_name'  => $i->product_name,
                'product_image' => $i->product_image,
                'price'         => (float) $i->price,
                'quantity'      => $i->quantity,
                'subtotal'      => (float) $i->subtotal,
            ])->values(),
            'status_history' => $order->statusHistory->map(fn($h) => [
                'status'     => $h->status,
                'note'       => $h->note,
                'changed_by' => $h->changed_by,
                'at'         => $h->created_at,
            ])->values(),
            'created_at' => $order->created_at,
            'updated_at' => $order->updated_at,
        ];
    }
}
