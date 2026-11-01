import { formatDateTime, formatRand, type PillTone } from '@/lib/corex';
import { type AuctionCard as AuctionCardData, type LotCard as LotCardData } from '@/types/corex';
import { Link } from '@inertiajs/react';
import { Bath, BedDouble, CalendarDays, Car, Gavel, MapPin } from 'lucide-react';
import { ReactNode } from 'react';

const pillStyles: Record<PillTone, string> = {
    live: 'bg-emerald-100 text-emerald-800',
    upcoming: 'bg-amber-100 text-amber-800',
    ended: 'bg-slate-200 text-slate-700',
    sold: 'bg-rose-100 text-rose-800',
};

export function PhasePill({ tone, children }: { tone: PillTone; children: ReactNode }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${pillStyles[tone]}`}>
            {tone === 'live' && <span className="size-1.5 animate-pulse rounded-full bg-emerald-600" aria-hidden="true" />}
            {children}
        </span>
    );
}

/** Stand-in artwork in the brand colours when CoreX has no picture. */
export function BrandBackdrop({ className, label }: { className?: string; label?: string }) {
    return (
        <div className={`bg-ink relative overflow-hidden ${className ?? ''}`} role={label ? 'img' : undefined} aria-label={label}>
            <div className="bg-brass/25 pointer-events-none absolute -top-10 -right-10 size-48 rounded-full blur-3xl" />
            <svg
                className="text-brass/15 absolute inset-x-0 bottom-0 h-1/3 w-full"
                viewBox="0 0 400 80"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path
                    fill="currentColor"
                    d="M0 80V52l30-22 30 22v-8h20V30l35-24 35 24v22h18l26-18 26 18v-6h22V26l32-20 32 20v28h20l24-16 24 16v26z"
                />
            </svg>
            <Gavel className="text-brass/50 absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
        </div>
    );
}

export function CoverImage({ src, alt, className }: { src: string | null | undefined; alt: string; className?: string }) {
    return src ? (
        <img src={src} alt={alt} className={`w-full object-cover ${className ?? ''}`} loading="lazy" />
    ) : (
        <BrandBackdrop className={className} />
    );
}

export function formatLabel(format: string | null | undefined): string {
    return format === 'live' ? 'Live auction' : 'Online auction';
}

export function AuctionCard({ auction }: { auction: AuctionCardData }) {
    const tone: PillTone = auction.phase === 'live' ? 'live' : auction.phase === 'upcoming' ? 'upcoming' : 'ended';
    const label = auction.phase === 'live' ? 'Live now' : auction.phase === 'upcoming' ? 'Upcoming' : (auction.phase_label ?? 'Finished');

    return (
        <article className="border-sand-dark flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
            <Link href={`/auctions/${auction.id}`} className="relative block" tabIndex={-1} aria-hidden="true">
                <CoverImage src={auction.image_url} alt="" className="aspect-[16/10]" />
                <div className="absolute top-3 left-3">
                    <PhasePill tone={tone}>{label}</PhasePill>
                </div>
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-brass-dark text-xs font-medium tracking-wider uppercase">
                    {formatLabel(auction.format)}
                    {auction.reference ? ` · ${auction.reference}` : ''}
                </p>
                <h3 className="font-display text-ink text-xl leading-snug">
                    <Link href={`/auctions/${auction.id}`} className="hover:underline">
                        {auction.title}
                    </Link>
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                        <CalendarDays className="text-brass-dark mt-0.5 size-4 shrink-0" />
                        <span>
                            {formatDateTime(auction.starts_at)}
                            {auction.ends_at && ` – ${formatDateTime(auction.ends_at)}`}
                        </span>
                    </li>
                    {auction.venue_name && (
                        <li className="flex items-start gap-2">
                            <MapPin className="text-brass-dark mt-0.5 size-4 shrink-0" /> {auction.venue_name}
                        </li>
                    )}
                </ul>
                <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <span className="text-sm text-slate-500">
                        {auction.lots_count ?? 0} {auction.lots_count === 1 ? 'lot' : 'lots'}
                    </span>
                    <Link
                        href={`/auctions/${auction.id}`}
                        className="bg-ink hover:bg-ink-soft inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium text-white"
                    >
                        View lots
                    </Link>
                </div>
            </div>
        </article>
    );
}

export function guidePrice(lot: Pick<LotCardData, 'guide_price_min' | 'guide_price_max'>): string | null {
    if (lot.guide_price_min && lot.guide_price_max) {
        return `${formatRand(lot.guide_price_min)} – ${formatRand(lot.guide_price_max)}`;
    }

    if (lot.guide_price_min || lot.guide_price_max) {
        return formatRand(lot.guide_price_min ?? lot.guide_price_max);
    }

    return null;
}

export function LotFacts({ lot, extra }: { lot: Pick<LotCardData, 'bedrooms' | 'bathrooms' | 'garages'>; extra?: ReactNode }) {
    const facts = [
        { icon: BedDouble, value: lot.bedrooms, label: 'bedrooms' },
        { icon: Bath, value: lot.bathrooms, label: 'bathrooms' },
        { icon: Car, value: lot.garages, label: 'garages' },
    ].filter((fact) => fact.value !== null && fact.value !== undefined);

    if (facts.length === 0 && !extra) {
        return null;
    }

    return (
        <ul className="flex flex-wrap gap-4 text-sm text-slate-600">
            {facts.map(({ icon: Icon, value, label }) => (
                <li key={label} className="flex items-center gap-1.5">
                    <Icon className="text-brass-dark size-4" aria-hidden="true" />
                    {value} <span className="sr-only">{label}</span>
                </li>
            ))}
            {extra}
        </ul>
    );
}

export function LotCard({ lot, auctionId }: { lot: LotCardData; auctionId: number | string }) {
    const href = `/auctions/${auctionId}/lots/${lot.id}`;
    const guide = guidePrice(lot);
    const status = (lot.status ?? '').toLowerCase();

    return (
        <article className="border-sand-dark flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
            <Link href={href} className="relative block" tabIndex={-1} aria-hidden="true">
                <CoverImage src={lot.image_url} alt="" className="aspect-[4/3]" />
                {lot.lot_number !== null && (
                    <span className="bg-ink absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold text-white">Lot {lot.lot_number}</span>
                )}
                {(status.includes('sold') || status.includes('passed')) && (
                    <span className="absolute top-3 right-3">
                        <PhasePill tone={status.includes('sold') ? 'sold' : 'ended'}>{status.includes('sold') ? 'Sold' : 'Passed in'}</PhasePill>
                    </span>
                )}
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-5">
                <h3 className="font-display text-ink text-lg leading-snug">
                    <Link href={href} className="hover:underline">
                        {lot.title}
                    </Link>
                </h3>
                {(lot.suburb || lot.city) && (
                    <p className="flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="text-brass-dark size-4" /> {[lot.suburb, lot.city].filter(Boolean).join(', ')}
                    </p>
                )}
                <LotFacts lot={lot} />
                <dl className="border-sand-dark mt-auto grid grid-cols-2 gap-3 border-t pt-4 text-sm">
                    <div>
                        <dt className="text-slate-500">Opening bid</dt>
                        <dd className="text-ink font-semibold whitespace-nowrap">{formatRand(lot.opening_bid)}</dd>
                    </div>
                    {guide && (
                        <div>
                            <dt className="text-slate-500">Guide price</dt>
                            <dd className="text-ink font-semibold">{guide}</dd>
                        </div>
                    )}
                </dl>
            </div>
        </article>
    );
}
