<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inventory extends Model
{
    public $timestamps = false;

    protected $table = 'inventory';

    protected $fillable = [
        'product_id',
        'quantity',
        'reserved_quantity',
        'low_stock_threshold',
    ];

    protected $casts = [
        'quantity'            => 'integer',
        'reserved_quantity'   => 'integer',
        'low_stock_threshold' => 'integer',
        'updated_at'          => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Available stock = quantity - reserved_quantity
     */
    public function getAvailableQuantityAttribute(): int
    {
        return max(0, $this->quantity - $this->reserved_quantity);
    }

    /**
     * Whether the product is low on stock.
     */
    public function isLowStock(): bool
    {
        return $this->available_quantity <= $this->low_stock_threshold;
    }
}
