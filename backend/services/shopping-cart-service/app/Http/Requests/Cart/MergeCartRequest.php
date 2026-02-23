<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class MergeCartRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'session_id' => ['required', 'string'],
            'user_id'    => ['required', 'integer', 'min:1'],
        ];
    }
}
