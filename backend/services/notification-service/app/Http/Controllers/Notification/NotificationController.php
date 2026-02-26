<?php

namespace App\Http\Controllers\Notification;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\SendEmailRequest;
use App\Http\Requests\Notification\SendSmsRequest;
use App\Http\Requests\Notification\StoreTemplateRequest;
use App\Models\NotificationTemplate;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notificationService) {}

    // ─── Email ──────────────────────────────────────────────────────────────────

    /**
     * POST /api/notifications/email
     * Send a plain or template-based email.
     */
    public function sendEmail(SendEmailRequest $request): JsonResponse
    {
        $data = $request->validated();

        // If a template name is provided, use template-based dispatch
        if (!empty($data['template_name'])) {
            $results = $this->notificationService->sendFromTemplate(
                $data['template_name'],
                $data['recipient'],
                $data['variables'] ?? [],
                null,
                $data['user_id'] ?? null,
            );
            return response()->json(['message' => 'Email dispatched via template.', 'data' => $results], 201);
        }

        $notification = $this->notificationService->sendEmail(
            $data['recipient'],
            $data['subject'],
            $data['message'],
            $data['user_id'] ?? null,
        );

        return response()->json([
            'message' => 'Email notification sent.',
            'data'    => $this->notificationService->formatNotification($notification),
        ], 201);
    }

    // ─── SMS ─────────────────────────────────────────────────────────────────────

    /**
     * POST /api/notifications/sms
     * Send an SMS via Twilio.
     */
    public function sendSms(SendSmsRequest $request): JsonResponse
    {
        $data = $request->validated();

        $notification = $this->notificationService->sendSms(
            $data['recipient'],
            $data['message'],
            $data['user_id'] ?? null,
        );

        return response()->json([
            'message' => 'SMS notification sent.',
            'data'    => $this->notificationService->formatNotification($notification),
        ], 201);
    }

    // ─── History ─────────────────────────────────────────────────────────────────

    /**
     * GET /api/notifications/history
     * Get paginated notification history (admin), filterable by type, status, user_id.
     */
    public function history(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->getHistory(
            $request->only(['type', 'status', 'user_id']),
            (int) $request->query('per_page', 20),
        );

        return response()->json([
            'data' => $notifications->through(
                fn($n) => $this->notificationService->formatNotification($n)
            ),
        ]);
    }

    // ─── Templates ────────────────────────────────────────────────────────────────

    /**
     * GET /api/notifications/templates
     * List all notification templates.
     */
    public function listTemplates(): JsonResponse
    {
        $templates = $this->notificationService->getAllTemplates();
        return response()->json([
            'data' => $templates->map(fn($t) => $this->notificationService->formatTemplate($t))->values(),
        ]);
    }

    /**
     * POST /api/notifications/templates
     * Create a new template (admin).
     */
    public function createTemplate(StoreTemplateRequest $request): JsonResponse
    {
        $template = $this->notificationService->createTemplate($request->validated());
        return response()->json([
            'message' => 'Template created.',
            'data'    => $this->notificationService->formatTemplate($template),
        ], 201);
    }

    /**
     * PUT /api/notifications/templates/{id}
     * Update a template (admin).
     */
    public function updateTemplate(Request $request, int $id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);
        $template = $this->notificationService->updateTemplate($template, $request->only([
            'subject', 'body', 'type', 'is_active',
        ]));

        return response()->json([
            'message' => 'Template updated.',
            'data'    => $this->notificationService->formatTemplate($template),
        ]);
    }

    /**
     * DELETE /api/notifications/templates/{id}
     * Delete a template (admin).
     */
    public function deleteTemplate(int $id): JsonResponse
    {
        $template = NotificationTemplate::findOrFail($id);
        $this->notificationService->deleteTemplate($template);

        return response()->json(['message' => 'Template deleted.']);
    }
}
