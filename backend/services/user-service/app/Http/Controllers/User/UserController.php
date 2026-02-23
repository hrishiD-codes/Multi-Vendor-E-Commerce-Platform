<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateProfileRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * GET /api/users/{id}
     * Get a user's profile. Users can only view their own profile unless admin.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $authUser = $request->user();

        // Admins can view any user; customers can only view themselves
        if (! $authUser->isAdmin() && $authUser->id !== $id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $user = \App\Models\User::findOrFail($id);

        return response()->json(['user' => $user]);
    }

    /**
     * PUT /api/users/{id}
     * Update a user's profile.
     */
    public function update(UpdateProfileRequest $request, int $id): JsonResponse
    {
        $authUser = $request->user();

        // Only the user themselves or an admin can update
        if (! $authUser->isAdmin() && $authUser->id !== $id) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $user = \App\Models\User::findOrFail($id);
        $user->update($request->validated());

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user'    => $user->fresh(),
        ]);
    }

    /**
     * GET /api/admin/users  (admin only)
     * List all users.
     */
    public function index(Request $request): JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $users = \App\Models\User::orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }
}
