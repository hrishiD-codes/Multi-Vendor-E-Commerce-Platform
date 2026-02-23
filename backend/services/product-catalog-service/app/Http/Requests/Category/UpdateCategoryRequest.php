<?php

namespace App\Http\Requests\Category;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $categoryId = $this->route('id');

        return [
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255', "unique:categories,slug,{$categoryId}"],
            'description' => ['nullable', 'string'],
            'image_url'   => ['nullable', 'url'],
            'parent_id'   => ['nullable', 'integer', 'exists:categories,id'],
            'is_active'   => ['nullable', 'boolean'],
        ];
    }
}
