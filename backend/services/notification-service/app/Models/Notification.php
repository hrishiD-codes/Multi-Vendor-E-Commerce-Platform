<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'user_id',
        'recipient',
        'subject',
        'message',
        'template_name',
        'status',
        'failure_reason',
        'sent_at',
    ];

    protected $casts = [
        'user_id' => 'integer',
        'sent_at' => 'datetime',
    ];

    public function markSent(): void
    {
        $this->update(['status' => 'sent', 'sent_at' => now()]);
    }

    public function markFailed(string $reason): void
    {
        $this->update(['status' => 'failed', 'failure_reason' => $reason]);
    }
}
