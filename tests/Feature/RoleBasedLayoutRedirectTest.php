<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleBasedLayoutRedirectTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $staff;

    protected function setUp(): void
    {
        parent::setUp();

        Role::firstOrCreate(['name' => 'Admin']);
        Role::firstOrCreate(['name' => 'Staff']);

        $this->admin = User::factory()->create(['name' => 'Admin User']);
        $this->admin->assignRole('Admin');

        $this->staff = User::factory()->create(['name' => 'Staff User']);
        $this->staff->assignRole('Staff');
    }

    public function test_admin_is_redirected_to_dashboard_post_login(): void
    {
        $response = $this->post('/login', [
            'email' => $this->admin->email,
            'password' => 'password', // default password from User factory
        ]);

        $response->assertRedirect(route('dashboard'));
    }

    public function test_staff_is_redirected_to_pos_post_login(): void
    {
        $response = $this->post('/login', [
            'email' => $this->staff->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('orders.index'));
    }

    public function test_staff_can_access_profile_edit_page(): void
    {
        $response = $this->actingAs($this->staff)
            ->get(route('profile.edit'));

        $response->assertStatus(200);
    }

    public function test_staff_cannot_access_categories_and_is_redirected_to_pos(): void
    {
        // Category controller requires check:page.categories middleware or check:category.*
        // RestrictStaff middleware blocks any route not allowed for non-admin
        $response = $this->actingAs($this->staff)
            ->get(route('categories.index'));

        $response->assertRedirect(route('orders.index'));
    }
}
