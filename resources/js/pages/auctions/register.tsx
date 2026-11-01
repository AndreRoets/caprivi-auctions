import { Field, inputClass } from '@/components/site/form-field';
import SiteLayout from '@/layouts/site-layout';
import { formatDate, formatDateTime } from '@/lib/corex';
import { type AuctionDetail, type RegistrationForm } from '@/types/corex';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileCheck2, Upload } from 'lucide-react';
import { FormEventHandler } from 'react';

type BidderType = 'individual' | 'company';

type RegisterFormData = {
    bidder_type: BidderType;
    company_name: string;
    company_reg_no: string;
    accept_conditions: boolean;
    documents: Record<string, File | null>;
    existing: Record<string, string>;
};

export default function RegisterToBid({ auction, registration }: { auction: AuctionDetail; registration: RegistrationForm }) {
    const current = registration.registration;
    const form = useForm<RegisterFormData>({
        bidder_type: (current?.bidder_type as BidderType) ?? 'individual',
        company_name: '',
        company_reg_no: '',
        accept_conditions: false,
        documents: {},
        existing: Object.fromEntries(Object.entries(registration.on_file ?? {}).map(([kind, files]) => [kind, files[0] ? String(files[0].id) : ''])),
    });
    const { data, setData, processing } = form;
    const errors = form.errors as Record<string, string | undefined>;
    const required = registration.required_documents?.[data.bidder_type] ?? [];

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        const kinds = required.map((doc) => doc.kind);

        form.transform((values) => ({
            ...values,
            documents: Object.fromEntries(Object.entries(values.documents).filter(([kind, file]) => file && kinds.includes(kind))),
            existing: Object.fromEntries(
                Object.entries(values.existing).filter(([kind, id]) => id && kinds.includes(kind) && !values.documents[kind]),
            ),
        }));
        form.post(`/auctions/${auction.id}/register`, { forceFormData: true, preserveScroll: true });
    };

    const blocked = !registration.open
        ? 'Registration for this auction is closed.'
        : current?.status === 'approved'
          ? `You are already approved${current.bidder_number ? ` as bidder #${current.bidder_number}` : ''}.`
          : current?.status === 'pending'
            ? 'Your registration is waiting for approval. We will email you once the auctioneer has reviewed it.'
            : null;

    return (
        <SiteLayout>
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
                <Link
                    href={`/auctions/${auction.id}`}
                    className="text-brass-dark inline-flex min-h-11 items-center gap-1 text-sm font-medium hover:underline"
                >
                    <ArrowLeft className="size-4" /> {auction.title}
                </Link>
                <h1 className="font-display text-ink mt-3 text-4xl">Register to bid</h1>
                <p className="mt-2 text-slate-600">
                    Upload your documents and accept the conditions of sale. The auctioneer approves registrations and emails your bidder number.
                    {registration.closes_at && <> Registration closes {formatDateTime(registration.closes_at)}.</>}
                </p>

                {current?.status === 'declined' && (
                    <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                        <p className="font-semibold">Your previous registration was declined.</p>
                        {current.declined_reason && <p className="mt-1">{current.declined_reason}</p>}
                        <p className="mt-1">Please fix the issue below and submit again.</p>
                    </div>
                )}

                {blocked ? (
                    <p className="bg-sand mt-8 rounded-xl p-5 text-slate-700">{blocked}</p>
                ) : (
                    <form onSubmit={submit} className="border-sand-dark mt-8 grid gap-8 rounded-2xl border bg-white p-6 sm:p-8" noValidate>
                        <fieldset className="grid gap-3">
                            <legend className="font-display text-ink mb-2 text-xl">I am bidding as</legend>
                            <div className="flex flex-wrap gap-2">
                                {(['individual', 'company'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        aria-pressed={data.bidder_type === type}
                                        onClick={() => setData('bidder_type', type)}
                                        className={`min-h-11 rounded-full border px-5 text-sm font-medium ${
                                            data.bidder_type === type
                                                ? 'border-ink bg-ink text-white'
                                                : 'hover:border-ink border-slate-300 bg-white text-slate-700'
                                        }`}
                                    >
                                        {type === 'individual' ? 'An individual' : 'A company or trust'}
                                    </button>
                                ))}
                            </div>
                            {errors.bidder_type && <p className="text-xs text-red-600">{errors.bidder_type}</p>}
                            {data.bidder_type === 'company' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <Field label="Company name" error={errors.company_name}>
                                        <input
                                            className={inputClass}
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                        />
                                    </Field>
                                    <Field label="Registration number" error={errors.company_reg_no}>
                                        <input
                                            className={inputClass}
                                            value={data.company_reg_no}
                                            onChange={(e) => setData('company_reg_no', e.target.value)}
                                        />
                                    </Field>
                                </div>
                            )}
                        </fieldset>

                        <fieldset className="grid gap-4">
                            <legend className="font-display text-ink mb-2 text-xl">Documents</legend>
                            <p className="-mt-2 text-sm text-slate-600">PDF, JPG or PNG, up to 10 MB each.</p>
                            {required.length === 0 && <p className="text-sm text-slate-600">No documents are needed for this auction.</p>}
                            {required.map((doc) => {
                                const onFile = registration.on_file?.[doc.kind] ?? [];
                                const useExisting = !data.documents[doc.kind] && data.existing[doc.kind];
                                const error = errors[`documents.${doc.kind}`] ?? errors[`existing.${doc.kind}`] ?? errors[`documents`];

                                return (
                                    <div key={doc.kind} className="border-sand-dark grid gap-3 rounded-xl border p-4">
                                        <p className="text-ink font-medium">{doc.label}</p>
                                        {onFile.length > 0 && (
                                            <label className="flex min-h-11 items-center gap-3 text-sm">
                                                <input
                                                    type="checkbox"
                                                    className="accent-ink size-5"
                                                    checked={Boolean(useExisting)}
                                                    onChange={(e) => {
                                                        setData('existing', {
                                                            ...data.existing,
                                                            [doc.kind]: e.target.checked ? String(onFile[0].id) : '',
                                                        });
                                                        if (e.target.checked) {
                                                            setData('documents', { ...data.documents, [doc.kind]: null });
                                                        }
                                                    }}
                                                />
                                                <FileCheck2 className="text-brass-dark size-4" />
                                                Use the one on file: {onFile[0].name}
                                                {onFile[0].uploaded_at && (
                                                    <span className="text-slate-500">({formatDate(onFile[0].uploaded_at)})</span>
                                                )}
                                            </label>
                                        )}
                                        {!useExisting && (
                                            <label className="hover:bg-sand flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm">
                                                <Upload className="text-brass-dark size-4" />
                                                <span className="flex-1">{data.documents[doc.kind]?.name ?? 'Choose a file to upload'}</span>
                                                <input
                                                    type="file"
                                                    accept="application/pdf,image/jpeg,image/png"
                                                    className="sr-only"
                                                    onChange={(e) =>
                                                        setData('documents', { ...data.documents, [doc.kind]: e.target.files?.[0] ?? null })
                                                    }
                                                />
                                            </label>
                                        )}
                                        {error && <p className="text-xs text-red-600">{error}</p>}
                                    </div>
                                );
                            })}
                        </fieldset>

                        <fieldset className="grid gap-3">
                            <legend className="font-display text-ink mb-2 text-xl">Conditions of sale</legend>
                            {registration.conditions_text && (
                                <div
                                    className="bg-sand max-h-64 overflow-y-auto rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line text-slate-700"
                                    tabIndex={0}
                                >
                                    {registration.conditions_text}
                                </div>
                            )}
                            <label className="flex min-h-11 items-start gap-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="accent-ink mt-0.5 size-5"
                                    checked={data.accept_conditions}
                                    onChange={(e) => setData('accept_conditions', e.target.checked)}
                                />
                                I have read and accept the conditions of sale.
                            </label>
                            {errors.accept_conditions && <p className="ml-8 text-xs text-red-600">{errors.accept_conditions}</p>}
                            {registration.fee_notice && <p className="text-xs whitespace-pre-line text-slate-600">{registration.fee_notice}</p>}
                        </fieldset>

                        {errors.form && (
                            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                                {errors.form}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-ink hover:bg-ink-soft min-h-12 rounded-full px-6 font-semibold text-white disabled:opacity-60"
                        >
                            {processing ? 'Submitting…' : 'Submit registration'}
                        </button>
                    </form>
                )}
            </div>
        </SiteLayout>
    );
}
