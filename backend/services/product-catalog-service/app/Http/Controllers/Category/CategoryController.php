<?php

namespace App\Http\Controllers\Category;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function __construct(private readonly ProductService $productService) {}

    /**
     * GET /api/categories  — public
     */
    public function index(): JsonResponse
    {
        $categories = $this->productService->listCategories();
        return response()->json(['data' => $categories]);
    }

    /**
     * GET /api/categories/{id}  — public
     */
    public function show(int $id): JsonResponse
    {
        $category = $this->productService->findCategory($id);
        return response()->json(['data' => $category]);
    }

    /**
     * POST /api/categories  — admin only
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $category = $this->productService->createCategory($request->validated());
        return response()->json([
            'message' => 'Category created successfully.',
            'data'    => $category,
        ], 201);
    }

    /**
     * PUT /api/categories/{id}  — admin only
     */
    public function update(UpdateCategoryRequest $request, int $id): JsonResponse
    {
        $category = $this->productService->updateCategory($id, $request->validated());
        return response()->json([
            'message' => 'Category updated successfully.',
            'data'    => $category,
        ]);
    }

    /**
     * DELETE /api/categories/{id}  — admin only
     */
    public function destroy(int $id): JsonResponse
    {
        $this->productService->deleteCategory($id);
        return response()->json(['message' => 'Category deactivated successfully.']);
    }
}
