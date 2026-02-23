<?php

namespace App\Http\Requests\Product;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $productId = $this->route('id');

        return [
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price'       => ['sometimes', 'required', 'numeric', 'min:0'],
            'sku'         => ['sometimes', 'required', 'string', 'max:100', "unique:products,sku,{$productId}"],
            'image_url'   => ['nullable', 'url'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'is_active'   => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
        ];
    }
}
