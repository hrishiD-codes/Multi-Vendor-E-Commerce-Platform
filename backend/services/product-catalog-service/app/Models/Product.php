<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'sku',
        'image_url',
        'category_id',
        'is_active',
        'is_featured',
    ];

    protected $casts = [
        'price'       => 'decimal:2',
        'is_active'   => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class);
    }

    /**
     * Scope: only active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope: featured products for homepage.
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->where('is_active', true);
    }

    /**
     * Scope: full-text search on name + description.
     */
    public function scopeSearch($query, string $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'ILIKE', "%{$term}%")
              ->orWhere('description', 'ILIKE', "%{$term}%")
              ->orWhere('sku', 'ILIKE', "%{$term}%");
        });
    }
}
