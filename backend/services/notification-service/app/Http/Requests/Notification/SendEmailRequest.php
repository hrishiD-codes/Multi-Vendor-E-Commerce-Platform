<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class SendEmailRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'recipient' => ['required', 'email'],
            'subject'   => ['required', 'string', 'max:255'],
            'message'   => ['required', 'string'],
            'user_id'   => ['nullable', 'integer'],
        ];
    }
}
