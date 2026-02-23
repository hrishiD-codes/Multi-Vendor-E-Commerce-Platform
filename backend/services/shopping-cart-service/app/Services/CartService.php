<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CartService
{
    // ─── Cart Resolution ───────────────────────────────────────────────────────

    /**
     * Resolve cart for an authenticated user, creating one if it doesn't exist.
     */
    public function getOrCreateForUser(int $userId): Cart
    {
        return Cart::firstOrCreate(
            ['user_id' => $userId, 'session_id' => null],
        );
    }

    /**
     * Resolve cart for a guest session, creating one if it doesn't exist.
     */
    public function getOrCreateForSession(string $sessionId): Cart
    {
        return Cart::firstOrCreate(
            ['session_id' => $sessionId, 'user_id' => null],
        );
    }

    /**
     * Get a cart with all its items loaded.
     */
    public function getCart(Cart $cart): Cart
    {
        return $cart->load('items');
    }

    /**
     * Format a cart for API response (includes computed fields).
     */
    public function formatCart(Cart $cart): array
    {
        $cart->loadMissing('items');

        return [
            'id'          => $cart->id,
            'user_id'     => $cart->user_id,
            'session_id'  => $cart->session_id,
            'items'       => $cart->items->map(fn($item) => [
                'id'           => $item->id,
                'product_id'   => $item->product_id,
                'product_name' => $item->product_name,
                'price'        => (float) $item->price,
                'image_url'    => $item->image_url,
                'quantity'     => $item->quantity,
                'subtotal'     => $item->subtotal,
            ])->values(),
            'subtotal'    => $cart->subtotal,
            'total_items' => $cart->total_items,
        ];
    }

    // ─── Item Operations ───────────────────────────────────────────────────────

    /**
     * Add a product to the cart or increment its quantity if already present.
     */
    public function addItem(Cart $cart, array $data): CartItem
    {
        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $data['product_id'])
            ->first();

        if ($item) {
            $item->increment('quantity', $data['quantity'] ?? 1);
            // Update product snapshot in case it changed
            $item->update([
                'product_name' => $data['product_name'],
                'price'        => $data['price'],
                'image_url'    => $data['image_url'] ?? $item->image_url,
            ]);
            return $item->fresh();
        }

        return CartItem::create([
            'cart_id'      => $cart->id,
            'product_id'   => $data['product_id'],
            'product_name' => $data['product_name'],
            'price'        => $data['price'],
            'image_url'    => $data['image_url'] ?? null,
            'quantity'     => $data['quantity'] ?? 1,
        ]);
    }

    /**
     * Update the quantity of a specific cart item.
     */
    public function updateItem(Cart $cart, int $itemId, int $quantity): CartItem
    {
        $item = CartItem::where('id', $itemId)
            ->where('cart_id', $cart->id)
            ->firstOrFail();

        $item->update(['quantity' => $quantity]);
        return $item->fresh();
    }

    /**
     * Remove a specific item from the cart.
     */
    public function removeItem(Cart $cart, int $itemId): void
    {
        CartItem::where('id', $itemId)
            ->where('cart_id', $cart->id)
            ->firstOrFail()
            ->delete();
    }

    /**
     * Clear all items from the cart.
     */
    public function clearCart(Cart $cart): void
    {
        $cart->items()->delete();
    }

    /**
     * Merge a guest cart into a user cart on login.
     * All guest items are transferred; guest cart is then deleted.
     */
    public function mergeGuestCart(string $sessionId, int $userId): Cart
    {
        $guestCart = Cart::where('session_id', $sessionId)
            ->where('user_id', null)
            ->first();

        $userCart = $this->getOrCreateForUser($userId);

        if ($guestCart) {
            foreach ($guestCart->items as $guestItem) {
                $existing = CartItem::where('cart_id', $userCart->id)
                    ->where('product_id', $guestItem->product_id)
                    ->first();

                if ($existing) {
                    $existing->increment('quantity', $guestItem->quantity);
                } else {
                    CartItem::create([
                        'cart_id'      => $userCart->id,
                        'product_id'   => $guestItem->product_id,
                        'product_name' => $guestItem->product_name,
                        'price'        => $guestItem->price,
                        'image_url'    => $guestItem->image_url,
                        'quantity'     => $guestItem->quantity,
                    ]);
                }
            }

            $guestCart->delete(); // cascade deletes items
        }

        return $userCart->load('items');
    }
}
