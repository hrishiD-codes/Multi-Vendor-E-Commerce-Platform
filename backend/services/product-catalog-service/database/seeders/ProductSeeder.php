<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // ── Categories ────────────────────────────────────────────────
        $electronics = Category::updateOrCreate(
            ['slug' => 'electronics'],
            ['name' => 'Electronics', 'description' => 'Gadgets and devices', 'is_active' => true]
        );
        $clothing = Category::updateOrCreate(
            ['slug' => 'clothing'],
            ['name' => 'Clothing', 'description' => 'Fashion and apparel', 'is_active' => true]
        );
        $homeAndLiving = Category::updateOrCreate(
            ['slug' => 'home-living'],
            ['name' => 'Home & Living', 'description' => 'Furniture and decor', 'is_active' => true]
        );
        $sports = Category::updateOrCreate(
            ['slug' => 'sports'],
            ['name' => 'Sports & Outdoors', 'description' => 'Equipment and gear', 'is_active' => true]
        );

        // ── Products ──────────────────────────────────────────────────
        $products = [
            [
                'name'        => 'Wireless Noise-Cancelling Headphones',
                'description' => 'Premium audio experience with 40-hour battery life and active noise cancellation.',
                'price'       => 299.99,
                'sku'         => 'ELEC-HEADPHONES-001',
                'image_url'   => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
                'category_id' => $electronics->id,
                'is_active'   => true,
                'is_featured' => true,
                'quantity'    => 50,
            ],
            [
                'name'        => 'Mechanical Gaming Keyboard',
                'description' => 'RGB backlit mechanical keyboard with Cherry MX switches for pro gamers.',
                'price'       => 149.99,
                'sku'         => 'ELEC-KEYBOARD-001',
                'image_url'   => 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600',
                'category_id' => $electronics->id,
                'is_active'   => true,
                'is_featured' => true,
                'quantity'    => 35,
            ],
            [
                'name'        => 'Premium Cotton T-Shirt',
                'description' => 'Soft 100% organic cotton t-shirt available in multiple colours.',
                'price'       => 29.99,
                'sku'         => 'CLOTH-TSHIRT-001',
                'image_url'   => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
                'category_id' => $clothing->id,
                'is_active'   => true,
                'is_featured' => false,
                'quantity'    => 200,
            ],
            [
                'name'        => 'Ergonomic Office Chair',
                'description' => 'Lumbar-support office chair with adjustable armrests and breathable mesh back.',
                'price'       => 449.00,
                'sku'         => 'HOME-CHAIR-001',
                'image_url'   => 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600',
                'category_id' => $homeAndLiving->id,
                'is_active'   => true,
                'is_featured' => true,
                'quantity'    => 20,
            ],
            [
                'name'        => 'Yoga Mat Pro',
                'description' => 'Non-slip 6mm thick eco-friendly yoga and exercise mat.',
                'price'       => 59.99,
                'sku'         => 'SPORT-YOGA-001',
                'image_url'   => 'https://images.unsplash.com/photo-1601925228210-34d6dcf21e23?w=600',
                'category_id' => $sports->id,
                'is_active'   => true,
                'is_featured' => false,
                'quantity'    => 80,
            ],
            [
                'name'        => '4K Smart TV 55"',
                'description' => 'Ultra HD 55" smart TV with Dolby Vision and integrated streaming apps.',
                'price'       => 799.99,
                'sku'         => 'ELEC-TV-55-001',
                'image_url'   => 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
                'category_id' => $electronics->id,
                'is_active'   => true,
                'is_featured' => true,
                'quantity'    => 15,
            ],
        ];

        foreach ($products as $productData) {
            $quantity    = $productData['quantity'];
            $productData = collect($productData)->except('quantity')->toArray();

            $product = Product::updateOrCreate(
                ['sku' => $productData['sku']],
                $productData
            );

            Inventory::updateOrCreate(
                ['product_id' => $product->id],
                [
                    'quantity'            => $quantity,
                    'reserved_quantity'   => 0,
                    'low_stock_threshold' => 10,
                    'updated_at'          => now(),
                ]
            );
        }
    }
}
