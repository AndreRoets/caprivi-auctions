import { auctionTypeLabels, formatDateTime, formatRand, statusLabels } from '@/lib/site';
import { type Lot } from '@/types';
import { Link } from '@inertiajs/react';
import { Bath, BedDouble, Car, MapPin } from 'lucide-react';
import LotImage from './lot-image';

export function StatusBadge({ status }: { status: Lot['status'] }) {
    const styles: Record<Lot['status'], string> = {
        open: 'bg-emerald-100 text-emerald-800',
        upcoming: 'bg-amber-100 text-amber-800',
        closed: 'bg-slate-200 text-slate-700',
        sold: 'bg-rose-100 text-rose-800',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
            {status === 'open' && <span className="size-1.5 animate-pulse rounded-full bg-emerald-600" />}
            {statusLabels[status]}
        </span>
    );
}

export default function LotCard({ lot }: { lot: Lot }) {
    return (
        <article className="group border-sand-dark flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md">
            <Link href={route('lots.show', lot.slug)} className="relative block">
                <LotImage lot={lot} className="aspect-[4/3]" />
                <div className="absolute top-3 left-3">
                    <StatusBadge status={lot.status} />
                </div>
            </Link>
            <div className="flex flex-1 flex-col gap-3 p-5">
                <p className="text-brass-dark text-xs font-medium tracking-wider uppercase">
                    {auctionTypeLabels[lot.auction_type] ?? lot.auction_type} · Ref {lot.web_ref}
                </p>
                <h3 className="font-display text-ink text-lg leading-snug">
                    <Link href={route('lots.show', lot.slug)} className="hover:underline">
                        {lot.title}
                    </Link>
                </h3>
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                    <MapPin className="text-brass-dark size-4" />
                    {lot.suburb}, {lot.city}, {lot.province}
                </p>
                <div className="flex gap-4 text-sm text-slate-600">
                    {lot.bedrooms !== null && (
                        <span className="flex items-center gap-1">
                            <BedDouble className="size-4" /> {lot.bedrooms}
                        </span>
                    )}
                    {lot.bathrooms !== null && (
                        <span className="flex items-center gap-1">
                            <Bath className="size-4" /> {lot.bathrooms}
                        </span>
                    )}
                    {lot.garages !== null && (
                        <span className="flex items-center gap-1">
                            <Car className="size-4" /> {lot.garages}
                        </span>
                    )}
                </div>
                <div className="border-sand-dark mt-auto flex items-end justify-between border-t pt-3">
                    <div>
                        <p className="text-xs text-slate-500">Opening bid</p>
                        <p className="font-display text-ink text-xl">{formatRand(lot.opening_bid)}</p>
                    </div>
                    <p className="text-right text-xs text-slate-500">
                        Closes
                        <br />
                        <span className="font-medium text-slate-700">{formatDateTime(lot.bidding_closes_at)}</span>
                    </p>
                </div>
            </div>
        </article>
    );
}
