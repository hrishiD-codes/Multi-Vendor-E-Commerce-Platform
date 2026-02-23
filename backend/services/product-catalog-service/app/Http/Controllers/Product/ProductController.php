<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $productService) {}

    /**
     * GET /api/products  — public, paginated + filterable
     */
    public function index(Request $request): JsonResponse
    {
        $filters  = $request->only([
            'search', 'category_id', 'min_price', 'max_price',
            'is_featured', 'sort', 'order', 'per_page',
        ]);
        $products = $this->productService->listProducts($filters);

        return response()->json($products);
    }

    /**
     * GET /api/products/search?q=term
     */
    public function search(Request $request): JsonResponse
    {
        $term    = $request->query('q', '');
        $perPage = (int) $request->query('per_page', 15);
        $results = $this->productService->searchProducts($term, $perPage);

        return response()->json($results);
    }

    /**
     * GET /api/products/featured
     */
    public function featured(Request $request): JsonResponse
    {
        $limit    = (int) $request->query('limit', 8);
        $products = $this->productService->getFeaturedProducts($limit);

        return response()->json(['data' => $products]);
    }

    /**
     * GET /api/products/{id}  — public
     */
    public function show(int $id): JsonResponse
    {
        $product = $this->productService->findProduct($id);

        return response()->json(['data' => $product]);
    }

    /**
     * POST /api/products  — admin only
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->productService->createProduct($request->validated());

        return response()->json([
            'message' => 'Product created successfully.',
            'data'    => $product,
        ], 201);
    }

    /**
     * PUT /api/products/{id}  — admin only
     */
    public function update(UpdateProductRequest $request, int $id): JsonResponse
    {
        $product = $this->productService->updateProduct($id, $request->validated());

        return response()->json([
            'message' => 'Product updated successfully.',
            'data'    => $product,
        ]);
    }

    /**
     * DELETE /api/products/{id}  — admin only (soft-deactivates)
     */
    public function destroy(int $id): JsonResponse
    {
        $this->productService->deleteProduct($id);

        return response()->json(['message' => 'Product deactivated successfully.']);
    }

    /**
     * GET /api/admin/products  — admin, includes inactive
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $filters  = $request->only(['search', 'per_page']);
        $products = $this->productService->listAllProducts($filters);

        return response()->json($products);
    }
}
