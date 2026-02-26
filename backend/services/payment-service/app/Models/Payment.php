<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'currency',
        'payment_method',
        'gateway',
        'transaction_id',
        'payment_intent_id',
        'status',
        'refunded_amount',
        'failure_reason',
        'metadata',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'refunded_amount' => 'decimal:2',
        'metadata'        => 'array',
        'order_id'        => 'integer',
        'user_id'         => 'integer',
    ];

    public function logs(): HasMany
    {
        return $this->hasMany(PaymentLog::class)->orderByDesc('created_at');
    }

    public function isRefundable(): bool
    {
        return $this->status === 'succeeded' && $this->refunded_amount < $this->amount;
    }

    public function remainingRefundable(): float
    {
        return (float) ($this->amount - $this->refunded_amount);
    }
}
