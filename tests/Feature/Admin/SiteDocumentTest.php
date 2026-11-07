<?php

namespace Tests\Feature\Admin;

use App\Models\SiteDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\FakesCorex;
use Tests\TestCase;

class SiteDocumentTest extends TestCase
{
    use FakesCorex;
    use RefreshDatabase;

    public function test_guests_cannot_manage_documents(): void
    {
        $this->get(route('admin.documents.index'))->assertRedirect(route('login'));
        $this->post(route('admin.documents.store'))->assertRedirect(route('login'));
    }

    public function test_admin_can_upload_a_document_with_an_access_level(): void
    {
        Storage::fake(SiteDocument::DISK);

        $this->actingAs(User::factory()->create())
            ->post(route('admin.documents.store'), [
                'title' => 'Conditions of sale',
                'access' => SiteDocument::ACCESS_SIGNED_IN,
                'is_published' => true,
                'file' => UploadedFile::fake()->create('conditions.pdf', 100, 'application/pdf'),
            ])
            ->assertRedirect(route('admin.documents.index'));

        $document = SiteDocument::firstOrFail();
        $this->assertSame(SiteDocument::ACCESS_SIGNED_IN, $document->access);
        Storage::disk(SiteDocument::DISK)->assertExists($document->file_path);
    }

    public function test_upload_rejects_unknown_access_levels_and_dangerous_files(): void
    {
        Storage::fake(SiteDocument::DISK);

        $this->actingAs(User::factory()->create())
            ->post(route('admin.documents.store'), [
                'title' => 'Bad',
                'access' => 'admins',
                'is_published' => true,
                'file' => UploadedFile::fake()->create('shell.php', 1),
            ])
            ->assertSessionHasErrors(['access', 'file']);

        $this->assertDatabaseCount('site_documents', 0);
    }

    public function test_deleting_a_document_removes_its_file(): void
    {
        Storage::fake(SiteDocument::DISK);
        Storage::disk(SiteDocument::DISK)->put('site-documents/a.pdf', 'x');
        $document = SiteDocument::factory()->create(['file_path' => 'site-documents/a.pdf']);

        $this->actingAs(User::factory()->create())->delete(route('admin.documents.destroy', $document))->assertRedirect();

        $this->assertModelMissing($document);
        Storage::disk(SiteDocument::DISK)->assertMissing('site-documents/a.pdf');
    }

    public function test_everyone_documents_can_be_downloaded_by_guests(): void
    {
        Storage::fake(SiteDocument::DISK);
        Storage::disk(SiteDocument::DISK)->put('site-documents/a.pdf', 'pdf-body');
        $document = SiteDocument::factory()->create(['file_path' => 'site-documents/a.pdf']);

        $this->get(route('site-documents.download', $document))->assertOk()->assertDownload('conditions-of-sale.pdf');
    }

    public function test_signed_in_only_documents_send_guests_to_the_login_page(): void
    {
        $this->fakeCorex();
        Storage::fake(SiteDocument::DISK);
        Storage::disk(SiteDocument::DISK)->put('site-documents/a.pdf', 'pdf-body');
        $document = SiteDocument::factory()->signedInOnly()->create(['file_path' => 'site-documents/a.pdf']);

        $this->get(route('site-documents.download', $document))->assertRedirect();

        $this->actingAsBuyer()->get(route('site-documents.download', $document))->assertOk()->assertDownload();
    }

    public function test_unpublished_documents_are_not_downloadable_or_listed(): void
    {
        $this->fakeCorex();
        $document = SiteDocument::factory()->unpublished()->create();

        $this->get(route('site-documents.download', $document))->assertNotFound();
        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page->where('documents', []));
    }

    public function test_home_page_lists_published_documents_without_exposing_file_paths(): void
    {
        $this->fakeCorex();
        SiteDocument::factory()->signedInOnly()->create(['title' => 'Bidder guide']);

        $this->get(route('home'))->assertInertia(fn (Assert $page) => $page
            ->has('documents', 1)
            ->where('documents.0.title', 'Bidder guide')
            ->where('documents.0.requires_login', true)
            ->missing('documents.0.file_path'));
    }
}
