<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationTemplate extends Model
{
    protected $fillable = [
        'name',
        'type',
        'subject',
        'body',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Replace {{variable}} placeholders with actual values.
     */
    public function render(array $variables = []): array
    {
        $subject = $this->subject;
        $body    = $this->body;

        foreach ($variables as $key => $value) {
            $subject = str_replace("{{$key}}", $value, $subject ?? '');
            $body    = str_replace("{{$key}}", $value, $body);
        }

        return ['subject' => $subject, 'body' => $body];
    }
}
