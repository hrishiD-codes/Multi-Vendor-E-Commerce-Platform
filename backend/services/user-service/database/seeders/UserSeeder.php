<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin user
        User::updateOrCreate(
            ['email' => 'admin@ecommerce.com'],
            [
                'name'              => 'Admin User',
                'password'          => Hash::make('password'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // Sample customer
        User::updateOrCreate(
            ['email' => 'customer@ecommerce.com'],
            [
                'name'              => 'Test Customer',
                'password'          => Hash::make('password'),
                'role'              => 'customer',
                'email_verified_at' => now(),
            ]
        );
    }
}
