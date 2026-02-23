<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255', 'unique:categories,slug'],
            'description' => ['nullable', 'string'],
            'image_url'   => ['nullable', 'url'],
            'parent_id'   => ['nullable', 'integer', 'exists:categories,id'],
            'is_active'   => ['nullable', 'boolean'],
        ];
    }
}
