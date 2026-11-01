import { LotCard } from '@/components/auctions/auction-card';
import { Field, inputClass } from '@/components/site/form-field';
import SiteLayout from '@/layouts/site-layout';
import { formatDate, formatRand } from '@/lib/corex';
import { type BuyerAccount, type Registration } from '@/types/corex';
import { Link, useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import { FormEventHandler, ReactNode } from 'react';

const statusStyles: Record<string, string> = {
    approved: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    declined: 'bg-red-100 text-red-800',
};

function StatusPill({ status }: { status: string }) {
    return (
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[status] ?? 'bg-slate-200 text-slate-700'}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
    return (
        <section aria-labelledby={id} className="grid gap-4">
            <h2 id={id} className="font-display text-ink text-2xl">
                {title}
            </h2>
            {children}
        </section>
    );
}

function Empty({ children }: { children: ReactNode }) {
    return <p className="border-sand-dark rounded-xl border border-dashed p-5 text-sm text-slate-600">{children}</p>;
}

function RegistrationRow({ registration }: { registration: Registration }) {
    const auctionId = registration.auction?.id ?? registration.auction_id;

    return (
        <li className="flex flex-wrap items-start justify-between gap-3 p-4">
            <div>
                <Link href={`/auctions/${auctionId}`} className="text-ink font-medium hover:underline">
                    {registration.auction?.title ?? 'Auction'}
                </Link>
                <p className="text-sm text-slate-600">
                    {registration.bidder_type === 'company' ? 'Company' : 'Individual'}
                    {registration.bidder_number ? ` · Bidder #${registration.bidder_number}` : ''}
                </p>
                {registration.status === 'declined' && (
                    <p className="mt-1 text-sm text-red-700">
                        {registration.declined_reason}{' '}
                        <Link href={`/auctions/${auctionId}/register`} className="font-semibold underline">
                            Update and register again
                        </Link>
                    </p>
                )}
            </div>
            <StatusPill status={registration.status} />
        </li>
    );
}

export default function BuyerAccountPage({ account }: { account: BuyerAccount }) {
    const { data, setData, put, processing, errors, isDirty } = useForm({
        name: account.buyer?.name ?? '',
        phone: account.buyer?.phone ?? '',
    });

    const save: FormEventHandler = (event) => {
        event.preventDefault();
        put('/account', { preserveScroll: true });
    };

    return (
        <SiteLayout>
            <div className="mx-auto grid max-w-5xl gap-12 px-4 py-12 sm:px-6">
                <div>
                    <h1 className="font-display text-ink text-4xl">My account</h1>
                    <p className="mt-2 text-slate-600">{account.buyer?.email}</p>
                </div>

                <Section id="details-heading" title="My details">
                    <form
                        onSubmit={save}
                        className="border-sand-dark grid gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
                    >
                        <Field label="Full name" error={errors.name}>
                            <input className={inputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} autoComplete="name" />
                        </Field>
                        <Field label="Mobile number" error={errors.phone}>
                            <input
                                type="tel"
                                className={inputClass}
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                autoComplete="tel"
                            />
                        </Field>
                        <button
                            type="submit"
                            disabled={processing || !isDirty}
                            className="bg-ink hover:bg-ink-soft min-h-11 rounded-full px-6 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            {processing ? 'Saving…' : 'Save'}
                        </button>
                    </form>
                </Section>

                <Section id="registrations-heading" title="Auction registrations">
                    {account.registrations?.length ? (
                        <ul className="border-sand-dark divide-y divide-[var(--color-sand-dark)] rounded-2xl border bg-white">
                            {account.registrations.map((registration, index) => (
                                <RegistrationRow key={registration.id ?? index} registration={registration} />
                            ))}
                        </ul>
                    ) : (
                        <Empty>
                            You have not registered for an auction yet.{' '}
                            <Link href="/auctions" className="text-brass-dark font-medium underline">
                                Browse auctions
                            </Link>
                        </Empty>
                    )}
                </Section>

                <Section id="won-heading" title="Lots won">
                    {account.lots_won?.length ? (
                        <ul className="grid gap-4 sm:grid-cols-2">
                            {account.lots_won.map((lot) => (
                                <li key={lot.id} className="border-sand-dark rounded-2xl border bg-white p-5">
                                    <Link
                                        href={`/auctions/${lot.auction_id}/lots/${lot.id}`}
                                        className="font-display text-ink text-lg hover:underline"
                                    >
                                        {lot.title}
                                    </Link>
                                    <p className="mt-1 text-sm text-slate-600">
                                        Hammer price <strong className="text-ink">{formatRand(lot.hammer_price)}</strong>
                                        {lot.result_at && ` · ${formatDate(lot.result_at)}`}
                                    </p>
                                    {lot.sold_subject_to_confirmation && (
                                        <p className="mt-2 text-xs font-medium text-amber-800">Subject to seller confirmation</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Empty>Lots you win will appear here.</Empty>
                    )}
                </Section>

                <Section id="watching-heading" title="Watching">
                    {account.watching?.length ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {account.watching.map((lot) => (
                                <LotCard key={lot.id} lot={lot} auctionId={lot.auction_id} />
                            ))}
                        </div>
                    ) : (
                        <Empty>Tap “Watch this lot” on any lot to keep it here.</Empty>
                    )}
                </Section>

                <Section id="invoices-heading" title="Invoices">
                    {account.invoices?.length ? (
                        <div className="border-sand-dark overflow-x-auto rounded-2xl border bg-white">
                            <table className="w-full text-sm">
                                <thead className="bg-sand text-left text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Invoice</th>
                                        <th className="px-4 py-3 font-medium">Lot</th>
                                        <th className="px-4 py-3 font-medium">Total</th>
                                        <th className="px-4 py-3 font-medium">Deposit</th>
                                        <th className="px-4 py-3 font-medium">Balance</th>
                                        <th className="px-4 py-3">
                                            <span className="sr-only">Download</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--color-sand-dark)]">
                                    {account.invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">{invoice.number}</span>
                                                <span className="mt-1 block">
                                                    <StatusPill status={invoice.status} />
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {invoice.lot?.title ?? '—'}
                                                {invoice.auction?.title && (
                                                    <span className="block text-xs text-slate-500">{invoice.auction.title}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">{formatRand(invoice.total_amount)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatRand(invoice.deposit_amount)}
                                                {invoice.deposit_due_at && (
                                                    <span className="block text-xs text-slate-500">due {formatDate(invoice.deposit_due_at)}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                {formatRand(invoice.balance_amount)}
                                                {invoice.balance_due_at && (
                                                    <span className="block text-xs text-slate-500">due {formatDate(invoice.balance_due_at)}</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <a
                                                    href={`/account/invoices/${invoice.id}/pdf`}
                                                    className="text-brass-dark inline-flex min-h-11 items-center gap-1.5 font-medium underline"
                                                    aria-label={`Download invoice ${invoice.number} as PDF`}
                                                >
                                                    <Download className="size-4" /> PDF
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <Empty>No invoices yet.</Empty>
                    )}
                </Section>
            </div>
        </SiteLayout>
    );
}
