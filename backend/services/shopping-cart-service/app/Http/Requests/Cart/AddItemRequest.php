<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class AddItemRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'product_id'   => ['required', 'integer', 'min:1'],
            'product_name' => ['required', 'string', 'max:255'],
            'price'        => ['required', 'numeric', 'min:0'],
            'image_url'    => ['nullable', 'url'],
            'quantity'     => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
