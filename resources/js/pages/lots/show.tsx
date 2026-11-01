import Countdown from '@/components/site/countdown';
import { StatusBadge } from '@/components/site/lot-card';
import LotImage from '@/components/site/lot-image';
import SiteLayout, { useContactModal } from '@/layouts/site-layout';
import { auctionTypeLabels, formatDateTime, formatRand } from '@/lib/site';
import { type Lot } from '@/types';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Check, Gavel, MapPin } from 'lucide-react';

interface LotShowProps {
    lot: Lot;
    contactSubjects: string[];
}

function EnquireButton() {
    const { openContact } = useContactModal();

    return (
        <button type="button" onClick={openContact} className="border-ink text-ink hover:bg-sand w-full rounded-full border px-6 py-3 font-medium">
            Ask about this property
        </button>
    );
}

export default function LotShow({ lot, contactSubjects }: LotShowProps) {
    const facts: [string, string | null][] = [
        ['Web ref', lot.web_ref],
        ['Property type', lot.property_type],
        ['Bedrooms', lot.bedrooms?.toString() ?? null],
        ['Bathrooms', lot.bathrooms?.toString() ?? null],
        ['Garages', lot.garages?.toString() ?? null],
        ['Erf size', lot.erf_size ? `${lot.erf_size} m²` : null],
        ['Floor size', lot.floor_size ? `${lot.floor_size} m²` : null],
        ['Rates & taxes', lot.monthly_rates ? `${formatRand(lot.monthly_rates)} / month` : null],
        ['Levies', lot.monthly_levies ? `${formatRand(lot.monthly_levies)} / month` : null],
        ['Auctioneer', lot.auctioneer],
    ];

    return (
        <SiteLayout contactSubjects={contactSubjects} lotId={lot.id}>
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                <Link href={route('lots.index')} className="text-brass-dark inline-flex items-center gap-1 text-sm font-medium hover:underline">
                    <ArrowLeft className="size-4" /> All property on auction
                </Link>

                <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
                    <div>
                        <LotImage lot={lot} className="aspect-[16/9] rounded-3xl" />

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <StatusBadge status={lot.status} />
                            <span className="text-brass-dark text-xs font-medium tracking-wider uppercase">
                                {auctionTypeLabels[lot.auction_type] ?? lot.auction_type}
                            </span>
                        </div>
                        <h1 className="font-display text-ink mt-3 text-3xl sm:text-4xl">{lot.title}</h1>
                        <p className="mt-2 flex items-center gap-1.5 text-slate-600">
                            <MapPin className="text-brass-dark size-4" />
                            {[lot.address, lot.suburb, lot.city, lot.province].filter(Boolean).join(', ')}
                        </p>

                        <p className="mt-6 text-lg text-slate-700">{lot.summary}</p>
                        <div className="mt-4 space-y-4 whitespace-pre-line text-slate-600">{lot.description}</div>

                        <h2 className="font-display text-ink mt-10 text-2xl">Key facts</h2>
                        <dl className="border-sand-dark mt-4 grid grid-cols-2 gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-3">
                            {facts
                                .filter(([, value]) => value !== null)
                                .map(([label, value]) => (
                                    <div key={label}>
                                        <dt className="text-xs text-slate-500 uppercase">{label}</dt>
                                        <dd className="text-ink font-medium">{value}</dd>
                                    </div>
                                ))}
                        </dl>

                        {lot.features.length > 0 && (
                            <>
                                <h2 className="font-display text-ink mt-10 text-2xl">Features</h2>
                                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                                    {lot.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-slate-700">
                                            <Check className="size-4 text-emerald-600" /> {feature}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>

                    <aside className="h-fit space-y-4 lg:sticky lg:top-24">
                        <div className="bg-ink rounded-3xl p-6 text-white shadow-lg">
                            <p className="text-sm text-white/60">Opening bid</p>
                            <p className="font-display text-brass text-4xl">{formatRand(lot.opening_bid)}</p>
                            <div className="mt-6">
                                <p className="mb-2 text-sm text-white/60">{lot.status === 'upcoming' ? 'Bidding opens' : 'Bidding closes in'}</p>
                                {lot.status === 'upcoming' ? (
                                    <p className="font-medium">{formatDateTime(lot.bidding_opens_at)}</p>
                                ) : (
                                    <Countdown target={lot.bidding_closes_at} />
                                )}
                            </div>
                            <p className="mt-4 text-sm text-white/60">Closes {formatDateTime(lot.bidding_closes_at)}</p>
                            {lot.bid_url && lot.status !== 'sold' && (
                                <a
                                    href={lot.bid_url}
                                    target="_blank"
                                    rel="noopener"
                                    className="bg-brass text-ink mt-6 flex items-center justify-center gap-2 rounded-full px-6 py-3 font-medium hover:bg-white"
                                >
                                    <Gavel className="size-4" /> Register & bid
                                </a>
                            )}
                        </div>
                        <EnquireButton />
                        <p className="text-center text-xs text-slate-500">
                            Viewings by appointment. Bidders must register and complete FICA before the auction.
                        </p>
                    </aside>
                </div>
            </div>
        </SiteLayout>
    );
}
