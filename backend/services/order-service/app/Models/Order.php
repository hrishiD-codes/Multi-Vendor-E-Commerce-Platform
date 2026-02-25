<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'status',
        'shipping_address',
        'billing_address',
        'payment_status',
        'payment_method',
        'notes',
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'billing_address'  => 'array',
        'total_amount'     => 'decimal:2',
        'user_id'          => 'integer',
    ];

    // ─── Relationships ─────────────────────────────────────────────────────────

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderByDesc('created_at');
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Whether this order can still be cancelled by the customer.
     */
    public function isCancellable(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    /**
     * Generate a unique human-readable order number like ORD-20260225-XXXX.
     */
    public static function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $rand = strtoupper(substr(uniqid('', true), -6));
        return "ORD-{$date}-{$rand}";
    }
}
