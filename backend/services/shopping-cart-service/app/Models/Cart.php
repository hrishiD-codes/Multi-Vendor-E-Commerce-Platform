<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
    ];

    protected $casts = [
        'user_id' => 'integer',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Cart subtotal = sum of (price * quantity) for all items.
     */
    public function getSubtotalAttribute(): float
    {
        return $this->items->sum(fn($item) => $item->price * $item->quantity);
    }

    /**
     * Total item count for badge display.
     */
    public function getTotalItemsAttribute(): int
    {
        return $this->items->sum('quantity');
    }
}
