<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactEnquiryRequest;
use App\Models\ContactEnquiry;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Arr;

class ContactEnquiryController extends Controller
{
    public function store(StoreContactEnquiryRequest $request): RedirectResponse
    {
        ContactEnquiry::create(Arr::except($request->validated(), ['website']));

        return back()->with('success', 'Thanks, your message is on its way. We will be in touch shortly.');
    }
}
