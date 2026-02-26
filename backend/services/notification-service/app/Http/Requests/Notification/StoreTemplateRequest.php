<?php

namespace App\Http\Requests\Notification;

use Illuminate\Foundation\Http\FormRequest;

class StoreTemplateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'unique:notification_templates,name', 'max:100'],
            'type'      => ['required', 'in:email,sms,both'],
            'subject'   => ['nullable', 'string', 'max:255'],
            'body'      => ['required', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
