<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                => ['required', 'string', 'max:255'],
            'description'         => ['nullable', 'string'],
            'price'               => ['required', 'numeric', 'min:0'],
            'sku'                 => ['required', 'string', 'max:100', 'unique:products,sku'],
            'image_url'           => ['nullable', 'url'],
            'category_id'         => ['nullable', 'integer', 'exists:categories,id'],
            'is_active'           => ['nullable', 'boolean'],
            'is_featured'         => ['nullable', 'boolean'],
            'quantity'            => ['nullable', 'integer', 'min:0'],
            'low_stock_threshold' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
