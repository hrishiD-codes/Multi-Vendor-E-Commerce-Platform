<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class ProcessCodRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order_id' => ['required', 'integer', 'min:1'],
            'amount'   => ['required', 'numeric', 'min:0.01'],
        ];
    }
}
