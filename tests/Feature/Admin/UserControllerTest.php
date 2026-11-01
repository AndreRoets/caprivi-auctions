<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login(): void
    {
        $this->get(route('admin.users.index'))->assertRedirect(route('login'));
        $this->post(route('admin.users.store'))->assertRedirect(route('login'));
    }

    public function test_index_lists_users_without_passwords(): void
    {
        $admin = User::factory()->create();
        User::factory()->count(2)->create();

        $this->actingAs($admin)
            ->get(route('admin.users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('admin/users/index')
                ->has('users', 3)
                ->missing('users.0.password'));
    }

    public function test_admin_can_create_a_user_who_can_then_log_in(): void
    {
        $this->actingAs(User::factory()->create())
            ->post(route('admin.users.store'), [
                'name' => 'Thandi Mokoena',
                'email' => 'thandi@capriviauctions.co.za',
                'password' => 'secret-password',
                'password_confirmation' => 'secret-password',
            ])
            ->assertRedirect(route('admin.users.index'))
            ->assertSessionHas('success');

        $user = User::query()->where('email', 'thandi@capriviauctions.co.za')->sole();
        $this->assertSame('Thandi Mokoena', $user->name);
        $this->assertTrue(Hash::check('secret-password', $user->password));
    }

    public function test_store_rejects_a_duplicate_email_and_mismatched_password(): void
    {
        $admin = User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($admin)
            ->post(route('admin.users.store'), [
                'name' => 'Someone',
                'email' => 'taken@example.com',
                'password' => 'secret-password',
                'password_confirmation' => 'different',
            ])
            ->assertSessionHasErrors([
                'email' => 'The email has already been taken.',
                'password' => 'The password field confirmation does not match.',
            ]);

        $this->assertSame(1, User::query()->count());
    }

    public function test_update_without_password_keeps_the_existing_password(): void
    {
        $user = User::factory()->create(['password' => 'original-password']);

        $this->actingAs(User::factory()->create())
            ->put(route('admin.users.update', $user), [
                'name' => 'Renamed',
                'email' => $user->email,
                'password' => '',
                'password_confirmation' => '',
            ])
            ->assertRedirect(route('admin.users.index'));

        $user->refresh();
        $this->assertSame('Renamed', $user->name);
        $this->assertTrue(Hash::check('original-password', $user->password));
    }

    public function test_update_with_a_password_changes_it(): void
    {
        $user = User::factory()->create();

        $this->actingAs(User::factory()->create())
            ->put(route('admin.users.update', $user), [
                'name' => $user->name,
                'email' => $user->email,
                'password' => 'brand-new-password',
                'password_confirmation' => 'brand-new-password',
            ])
            ->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('brand-new-password', $user->refresh()->password));
    }

    public function test_admin_can_delete_another_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs(User::factory()->create())
            ->delete(route('admin.users.destroy', $user))
            ->assertRedirect(route('admin.users.index'));

        $this->assertModelMissing($user);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $admin = User::factory()->create();

        $this->actingAs($admin)
            ->delete(route('admin.users.destroy', $admin))
            ->assertForbidden();

        $this->assertModelExists($admin);
    }
}
