<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SiteDocumentRequest;
use App\Models\SiteDocument;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SiteDocumentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/documents/index', [
            'documents' => SiteDocument::query()->ordered()->get()->map(fn (SiteDocument $document) => [
                'id' => $document->id,
                'title' => $document->title,
                'original_name' => $document->original_name,
                'size' => $document->size,
                'access' => $document->access,
                'is_published' => $document->is_published,
            ]),
            'accessOptions' => SiteDocument::ACCESS_OPTIONS,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/documents/form', [
            'document' => null,
            'accessOptions' => SiteDocument::ACCESS_OPTIONS,
        ]);
    }

    public function store(SiteDocumentRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        SiteDocument::create([
            ...collect($validated)->except('file')->all(),
            'sort_order' => $validated['sort_order'] ?? 0,
            ...$this->storeFile($request),
        ]);

        return to_route('admin.documents.index')->with('success', 'Document added to the website.');
    }

    public function edit(SiteDocument $siteDocument): Response
    {
        return Inertia::render('admin/documents/form', [
            'document' => $siteDocument->only(['id', 'title', 'description', 'access', 'sort_order', 'is_published', 'original_name']),
            'accessOptions' => SiteDocument::ACCESS_OPTIONS,
        ]);
    }

    public function update(SiteDocumentRequest $request, SiteDocument $siteDocument): RedirectResponse
    {
        $validated = $request->validated();
        $file = $request->hasFile('file') ? $this->storeFile($request) : [];

        if ($file !== []) {
            $siteDocument->deleteFile();
        }

        $siteDocument->update([
            ...collect($validated)->except('file')->all(),
            'sort_order' => $validated['sort_order'] ?? 0,
            ...$file,
        ]);

        return to_route('admin.documents.index')->with('success', 'Document updated.');
    }

    public function destroy(SiteDocument $siteDocument): RedirectResponse
    {
        $siteDocument->deleteFile();
        $siteDocument->delete();

        return to_route('admin.documents.index')->with('success', 'Document deleted.');
    }

    /**
     * @return array{file_path: string, original_name: string, size: int}
     */
    private function storeFile(SiteDocumentRequest $request): array
    {
        $file = $request->file('file');

        return [
            'file_path' => $file->store('site-documents', SiteDocument::DISK),
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ];
    }
}
