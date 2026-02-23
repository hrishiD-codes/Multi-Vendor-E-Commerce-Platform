<?php

namespace App\Http\Controllers\Cart;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\AddItemRequest;
use App\Http\Requests\Cart\MergeCartRequest;
use App\Http\Requests\Cart\UpdateItemRequest;
use App\Models\Cart;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cartService) {}

    // ─── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Resolve the caller's cart from headers or session param.
     *   - Authenticated: X-User-Id header (set by API Gateway)
     *   - Guest:         ?session_id query param
     */
    private function resolveCart(Request $request): Cart
    {
        $userId    = $request->header('X-User-Id');
        $sessionId = $request->query('session_id');

        if ($userId) {
            return $this->cartService->getOrCreateForUser((int) $userId);
        }

        if ($sessionId) {
            return $this->cartService->getOrCreateForSession($sessionId);
        }

        // Fallback: create a session-based cart with a generated ID
        $newSession = 'guest_' . uniqid('', true);
        return $this->cartService->getOrCreateForSession($newSession);
    }

    // ─── Endpoints ─────────────────────────────────────────────────────────────

    /**
     * GET /api/cart
     * Get the current user's/guest's cart.
     */
    public function show(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        return response()->json(['data' => $this->cartService->formatCart($cart)]);
    }

    /**
     * POST /api/cart/items
     * Add an item (or increment if already present).
     */
    public function addItem(AddItemRequest $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $item = $this->cartService->addItem($cart, $request->validated());

        return response()->json([
            'message' => 'Item added to cart.',
            'data'    => $this->cartService->formatCart($cart->fresh()),
        ], 201);
    }

    /**
     * PUT /api/cart/items/{id}
     * Update quantity of a specific cart item.
     */
    public function updateItem(UpdateItemRequest $request, int $id): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $this->cartService->updateItem($cart, $id, $request->validated()['quantity']);

        return response()->json([
            'message' => 'Cart item updated.',
            'data'    => $this->cartService->formatCart($cart->fresh()),
        ]);
    }

    /**
     * DELETE /api/cart/items/{id}
     * Remove a specific item from the cart.
     */
    public function removeItem(Request $request, int $id): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $this->cartService->removeItem($cart, $id);

        return response()->json([
            'message' => 'Item removed from cart.',
            'data'    => $this->cartService->formatCart($cart->fresh()),
        ]);
    }

    /**
     * DELETE /api/cart
     * Clear all items from the cart.
     */
    public function clearCart(Request $request): JsonResponse
    {
        $cart = $this->resolveCart($request);
        $this->cartService->clearCart($cart);

        return response()->json(['message' => 'Cart cleared.']);
    }

    /**
     * POST /api/cart/merge
     * Merge guest cart into user cart on login.
     */
    public function mergeCart(MergeCartRequest $request): JsonResponse
    {
        $cart = $this->cartService->mergeGuestCart(
            $request->validated()['session_id'],
            $request->validated()['user_id'],
        );

        return response()->json([
            'message' => 'Cart merged successfully.',
            'data'    => $this->cartService->formatCart($cart),
        ]);
    }
}
