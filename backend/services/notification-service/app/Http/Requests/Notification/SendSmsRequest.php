<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class SendSmsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'recipient' => ['required', 'string'],  // E.164-format phone number
            'message'   => ['required', 'string', 'max:1600'],
            'user_id'   => ['nullable', 'integer'],
        ];
    }
}
