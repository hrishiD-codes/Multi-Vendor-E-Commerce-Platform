<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\UpdateInventoryRequest;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    public function __construct(private readonly ProductService $productService) {}

    /**
     * PUT /api/products/{id}/inventory  — admin only
     */
    public function update(UpdateInventoryRequest $request, int $productId): JsonResponse
    {
        $inventory = $this->productService->updateInventory($productId, $request->validated());

        return response()->json([
            'message' => 'Inventory updated successfully.',
            'data'    => $inventory,
        ]);
    }

    /**
     * GET /api/admin/inventory/low-stock  — admin only
     */
    public function lowStock(): JsonResponse
    {
        $products = $this->productService->getLowStockProducts();

        return response()->json(['data' => $products]);
    }
}
