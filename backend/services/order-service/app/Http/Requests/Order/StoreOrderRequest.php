<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'user_id'                       => ['required', 'integer', 'min:1'],
            'items'                         => ['required', 'array', 'min:1'],
            'items.*.product_id'            => ['required', 'integer', 'min:1'],
            'items.*.product_name'          => ['required', 'string', 'max:255'],
            'items.*.product_image'         => ['nullable', 'string'],
            'items.*.price'                 => ['required', 'numeric', 'min:0'],
            'items.*.quantity'              => ['required', 'integer', 'min:1'],

            'shipping_address'              => ['required', 'array'],
            'shipping_address.name'         => ['required', 'string'],
            'shipping_address.address_line' => ['required', 'string'],
            'shipping_address.city'         => ['required', 'string'],
            'shipping_address.state'        => ['nullable', 'string'],
            'shipping_address.postal_code'  => ['required', 'string'],
            'shipping_address.country'      => ['required', 'string'],
            'shipping_address.phone'        => ['nullable', 'string'],

            'billing_address'               => ['nullable', 'array'],
            'payment_method'                => ['nullable', 'string', 'in:cod,stripe,paypal'],
            'notes'                         => ['nullable', 'string', 'max:500'],
        ];
    }
}
