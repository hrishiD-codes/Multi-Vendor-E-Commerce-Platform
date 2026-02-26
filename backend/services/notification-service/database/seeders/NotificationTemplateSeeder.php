<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name'    => 'order_placed',
                'type'    => 'email',
                'subject' => 'Order Confirmed — {{order_number}}',
                'body'    => "Hi {{customer_name}},\n\nYour order {{order_number}} has been placed successfully!\n\nTotal: {{total_amount}}\n\nWe will notify you when your items are shipped.\n\nThank you for shopping with E-Kart!",
            ],
            [
                'name'    => 'order_shipped',
                'type'    => 'both',
                'subject' => 'Your Order {{order_number}} Has Been Shipped!',
                'body'    => "Hi {{customer_name}},\n\nGreat news! Your order {{order_number}} is on its way.\n\nTracking: {{tracking_number}}\nEstimated Delivery: {{estimated_delivery}}\n\nE-Kart",
            ],
            [
                'name'    => 'order_delivered',
                'type'    => 'email',
                'subject' => 'Order {{order_number}} Delivered!',
                'body'    => "Hi {{customer_name}},\n\nYour order {{order_number}} has been delivered. We hope you love your purchase!\n\nE-Kart",
            ],
            [
                'name'    => 'payment_confirmed',
                'type'    => 'email',
                'subject' => 'Payment Received for Order {{order_number}}',
                'body'    => "Hi {{customer_name}},\n\nWe have received your payment of {{amount}} for order {{order_number}}.\n\nE-Kart",
            ],
            [
                'name'    => 'order_cancelled',
                'type'    => 'email',
                'subject' => 'Order {{order_number}} Cancelled',
                'body'    => "Hi {{customer_name}},\n\nYour order {{order_number}} has been cancelled as requested.\n\nIf you have any questions, please contact our support team.\n\nE-Kart",
            ],
            [
                'name'    => 'welcome',
                'type'    => 'email',
                'subject' => 'Welcome to E-Kart, {{customer_name}}!',
                'body'    => "Hi {{customer_name}},\n\nWelcome to E-Kart! Your account has been created successfully.\n\nStart shopping now and enjoy free shipping on your first order!\n\nE-Kart",
            ],
            [
                'name'    => 'otp_sms',
                'type'    => 'sms',
                'subject' => null,
                'body'    => 'Your E-Kart OTP is {{otp}}. Valid for 10 minutes. Do not share with anyone.',
            ],
        ];

        foreach ($templates as $template) {
            NotificationTemplate::updateOrCreate(
                ['name' => $template['name']],
                array_merge($template, ['is_active' => true]),
            );
        }

        $this->command->info('Notification templates seeded: ' . count($templates));
    }
}
