<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStatusRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status' => [
                'required',
                'string',
                'in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            ],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
