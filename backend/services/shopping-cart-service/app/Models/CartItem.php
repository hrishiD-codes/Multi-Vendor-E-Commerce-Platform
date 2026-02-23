<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    protected $fillable = [
        'cart_id',
        'product_id',
        'product_name',
        'price',
        'image_url',
        'quantity',
    ];

    protected $casts = [
        'price'      => 'decimal:2',
        'quantity'   => 'integer',
        'product_id' => 'integer',
    ];

    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Line total = price × quantity.
     */
    public function getSubtotalAttribute(): float
    {
        return (float) $this->price * $this->quantity;
    }
}
