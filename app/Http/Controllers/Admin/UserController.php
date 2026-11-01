<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'created_at'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at?->toIso8601String(),
                ]),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/form', ['user' => null]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        User::create($request->validated());

        return to_route('admin.users.index')->with('success', 'User created. They can now log in with the password you set.');
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/form', [
            'user' => $user->only(['id', 'name', 'email']),
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $validated = $request->validated();

        $user->update(filled($validated['password'] ?? null) ? $validated : Arr::except($validated, ['password']));

        return to_route('admin.users.index')->with('success', 'User updated.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        abort_if($user->is($request->user()), 403, 'You cannot delete your own account from here.');

        $user->delete();

        return to_route('admin.users.index')->with('success', 'User deleted.');
    }
}
