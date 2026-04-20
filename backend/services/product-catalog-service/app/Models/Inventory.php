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

    protected $appends = [
        'available_quantity',
        'is_low_stock',
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
        return max(0, (int) ($this->quantity ?? 0) - (int) ($this->reserved_quantity ?? 0));
    }

    /**
     * Whether the product is low on stock.
     */
    public function getIsLowStockAttribute(): bool
    {
        return $this->available_quantity <= ($this->low_stock_threshold ?? 10);
    }
}
