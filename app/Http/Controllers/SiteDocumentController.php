<?php

namespace App\Http\Controllers;

use App\Models\SiteDocument;
use App\Support\Corex\BuyerSession;
use App\Support\Corex\CorexException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

/**
 * Serves the admin-uploaded auction documents, enforcing each document's access level.
 */
class SiteDocumentController extends Controller
{
    public function __invoke(Request $request, BuyerSession $buyer, SiteDocument $siteDocument): Response
    {
        abort_unless($siteDocument->is_published, 404);

        if ($siteDocument->requiresLogin() && ! $buyer->check()) {
            return CorexException::loginRequired()->render($request);
        }

        return response()
            ->download(
                Storage::disk(SiteDocument::DISK)->path($siteDocument->file_path),
                $siteDocument->original_name,
            )
            ->setPrivate();
    }
}
