<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductService
{
    // ─── Products ──────────────────────────────────────────────────────────────

    /**
     * Paginated list of products with optional filters.
     */
    public function listProducts(array $filters = []): LengthAwarePaginator
    {
        $query = Product::with(['category', 'inventory'])->active();

        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (! empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (! empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        if (! empty($filters['is_featured'])) {
            $query->where('is_featured', true);
        }

        $sort  = $filters['sort']  ?? 'created_at';
        $order = $filters['order'] ?? 'desc';

        $allowedSorts = ['price', 'name', 'created_at'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $order === 'asc' ? 'asc' : 'desc');
        }

        return $query->paginate($filters['per_page'] ?? 15);
    }

    /**
     * All products (admin, unfiltered).
     */
    public function listAllProducts(array $filters = []): LengthAwarePaginator
    {
        $query = Product::with(['category', 'inventory']);

        if (! empty($filters['search'])) {
            $query->search($filters['search']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Find product by ID (throws 404 if not found).
     */
    public function findProduct(int $id): Product
    {
        return Product::with(['category', 'inventory'])->findOrFail($id);
    }

    /**
     * Create a product and initialise its inventory.
     */
    public function createProduct(array $data): Product
    {
        $product = Product::create($data);

        // Auto-create inventory record
        Inventory::create([
            'product_id'          => $product->id,
            'quantity'            => $data['quantity'] ?? 0,
            'reserved_quantity'   => 0,
            'low_stock_threshold' => $data['low_stock_threshold'] ?? 10,
        ]);

        return $product->load(['category', 'inventory']);
    }

    /**
     * Update a product.
     */
    public function updateProduct(int $id, array $data): Product
    {
        $product = Product::findOrFail($id);
        $product->update($data);
        return $product->fresh(['category', 'inventory']);
    }

    /**
     * Soft-delete (deactivate) a product.
     */
    public function deleteProduct(int $id): void
    {
        $product = Product::findOrFail($id);
        $product->update(['is_active' => false]);
    }

    /**
     * Full-text search products.
     */
    public function searchProducts(string $term, int $perPage = 15): LengthAwarePaginator
    {
        return Product::with(['category', 'inventory'])
            ->active()
            ->search($term)
            ->paginate($perPage);
    }

    /**
     * Get featured products for homepage.
     */
    public function getFeaturedProducts(int $limit = 8): \Illuminate\Database\Eloquent\Collection
    {
        return Product::with(['category', 'inventory'])
            ->featured()
            ->limit($limit)
            ->get();
    }

    // ─── Categories ────────────────────────────────────────────────────────────

    public function listCategories(): \Illuminate\Database\Eloquent\Collection
    {
        return Category::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->get();
    }

    public function findCategory(int $id): Category
    {
        return Category::with(['children', 'products'])->findOrFail($id);
    }

    public function createCategory(array $data): Category
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);
        return Category::create($data);
    }

    public function updateCategory(int $id, array $data): Category
    {
        $category = Category::findOrFail($id);
        if (isset($data['name']) && ! isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }
        $category->update($data);
        return $category->fresh();
    }

    public function deleteCategory(int $id): void
    {
        $category = Category::findOrFail($id);
        $category->update(['is_active' => false]);
    }

    // ─── Inventory ─────────────────────────────────────────────────────────────

    public function updateInventory(int $productId, array $data): Inventory
    {
        $product   = Product::findOrFail($productId);
        $inventory = $product->inventory;

        if (! $inventory) {
            $inventory = Inventory::create([
                'product_id'          => $productId,
                'quantity'            => $data['quantity'] ?? 0,
                'reserved_quantity'   => $data['reserved_quantity'] ?? 0,
                'low_stock_threshold' => $data['low_stock_threshold'] ?? 10,
            ]);
        } else {
            $inventory->update(array_filter($data, fn($v) => $v !== null));
            $inventory->updated_at = now();
            $inventory->save();
        }

        return $inventory->fresh();
    }

    public function getLowStockProducts(): \Illuminate\Database\Eloquent\Collection
    {
        return Product::with(['inventory', 'category'])
            ->whereHas('inventory', fn($q) =>
                $q->whereRaw('quantity - reserved_quantity <= low_stock_threshold')
            )
            ->where('is_active', true)
            ->get();
    }
}
