<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\NotificationTemplate;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class NotificationService
{
    // ─── Email ──────────────────────────────────────────────────────────────────

    /**
     * Send a plain email notification.
     */
    public function sendEmail(
        string $recipient,
        string $subject,
        string $message,
        ?int $userId = null,
        ?string $templateName = null
    ): Notification {
        $notification = Notification::create([
            'type'          => 'email',
            'user_id'       => $userId,
            'recipient'     => $recipient,
            'subject'       => $subject,
            'message'       => $message,
            'template_name' => $templateName,
            'status'        => 'pending',
        ]);

        try {
            Mail::raw($message, function ($mail) use ($recipient, $subject) {
                $mail->to($recipient)->subject($subject);
            });

            $notification->markSent();
            Log::info("Email sent to {$recipient}.");

        } catch (\Exception $e) {
            $notification->markFailed($e->getMessage());
            Log::error("Email failed to {$recipient}: {$e->getMessage()}");
        }

        return $notification->fresh();
    }

    // ─── SMS (Twilio) ────────────────────────────────────────────────────────────

    /**
     * Send an SMS via Twilio REST API.
     */
    public function sendSms(
        string $phoneNumber,
        string $message,
        ?int $userId = null,
        ?string $templateName = null
    ): Notification {
        $notification = Notification::create([
            'type'          => 'sms',
            'user_id'       => $userId,
            'recipient'     => $phoneNumber,
            'subject'       => null,
            'message'       => $message,
            'template_name' => $templateName,
            'status'        => 'pending',
        ]);

        try {
            $sid   = config('services.twilio.sid');
            $token = config('services.twilio.token');
            $from  = config('services.twilio.from');

            if (!$sid || !$token) {
                throw new \RuntimeException('Twilio credentials not configured.');
            }

            $response = Http::withBasicAuth($sid, $token)
                ->asForm()
                ->post("https://api.twilio.com/2010-04-01/Accounts/{$sid}/Messages.json", [
                    'From' => $from,
                    'To'   => $phoneNumber,
                    'Body' => $message,
                ]);

            if ($response->failed()) {
                throw new \RuntimeException($response->json()['message'] ?? 'Twilio error');
            }

            $notification->markSent();
            Log::info("SMS sent to {$phoneNumber}.");

        } catch (\Exception $e) {
            $notification->markFailed($e->getMessage());
            Log::warning("SMS failed to {$phoneNumber}: {$e->getMessage()}");
        }

        return $notification->fresh();
    }

    // ─── Template-based Dispatch ────────────────────────────────────────────────

    /**
     * Send a notification using a named template with variable substitution.
     * Sends email and/or SMS depending on the template's type setting.
     */
    public function sendFromTemplate(
        string $templateName,
        string $emailRecipient,
        array  $variables = [],
        ?string $phoneNumber = null,
        ?int   $userId = null
    ): array {
        $template = NotificationTemplate::where('name', $templateName)
            ->where('is_active', true)
            ->first();

        if (!$template) {
            Log::warning("Notification template not found: {$templateName}");
            return [];
        }

        $rendered = $template->render($variables);
        $results  = [];

        if (in_array($template->type, ['email', 'both'])) {
            $results['email'] = $this->sendEmail(
                $emailRecipient,
                $rendered['subject'] ?? $templateName,
                $rendered['body'],
                $userId,
                $templateName,
            );
        }

        if (in_array($template->type, ['sms', 'both']) && $phoneNumber) {
            $results['sms'] = $this->sendSms(
                $phoneNumber,
                strip_tags($rendered['body']),
                $userId,
                $templateName,
            );
        }

        return $results;
    }

    // ─── History ─────────────────────────────────────────────────────────────────

    public function getHistory(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Notification::orderByDesc('created_at');

        if (!empty($filters['type']))   $query->where('type', $filters['type']);
        if (!empty($filters['status'])) $query->where('status', $filters['status']);
        if (!empty($filters['user_id'])) $query->where('user_id', $filters['user_id']);

        return $query->paginate($perPage);
    }

    // ─── Templates CRUD ──────────────────────────────────────────────────────────

    public function createTemplate(array $data): NotificationTemplate
    {
        return NotificationTemplate::create($data);
    }

    public function getAllTemplates(): \Illuminate\Database\Eloquent\Collection
    {
        return NotificationTemplate::orderBy('name')->get();
    }

    public function updateTemplate(NotificationTemplate $template, array $data): NotificationTemplate
    {
        $template->update($data);
        return $template->fresh();
    }

    public function deleteTemplate(NotificationTemplate $template): void
    {
        $template->delete();
    }

    // ─── Formatting ──────────────────────────────────────────────────────────────

    public function formatNotification(Notification $n): array
    {
        return [
            'id'             => $n->id,
            'type'           => $n->type,
            'user_id'        => $n->user_id,
            'recipient'      => $n->recipient,
            'subject'        => $n->subject,
            'message'        => $n->message,
            'template_name'  => $n->template_name,
            'status'         => $n->status,
            'failure_reason' => $n->failure_reason,
            'sent_at'        => $n->sent_at,
            'created_at'     => $n->created_at,
        ];
    }

    public function formatTemplate(NotificationTemplate $t): array
    {
        return [
            'id'        => $t->id,
            'name'      => $t->name,
            'type'      => $t->type,
            'subject'   => $t->subject,
            'body'      => $t->body,
            'is_active' => $t->is_active,
            'created_at'=> $t->created_at,
            'updated_at'=> $t->updated_at,
        ];
    }
}
