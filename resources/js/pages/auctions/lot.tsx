import { CoverImage, formatLabel, guidePrice, LotFacts, PhasePill } from '@/components/auctions/auction-card';
import BidCard from '@/components/auctions/bid-card';
import DocumentList from '@/components/auctions/document-list';
import EnquiryForm from '@/components/auctions/enquiry-form';
import PhotoGallery from '@/components/auctions/photo-gallery';
import SiteLayout from '@/layouts/site-layout';
import { clockOffset, formatRand, lotPill, photoUrl, timeAgo } from '@/lib/corex';
import { siteFetch, type SiteFetchError } from '@/lib/site';
import { type LiveLotState, type LotDetail } from '@/types/corex';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Images, MapPin, Ruler } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const POLL_MS = 3000;

/** Keeps the live bidding state fresh: polls the feed every 3 s while the tab is visible and bidding has not ended. */
function useLiveLot(lot: LotDetail, auctionId: number | string) {
    const [live, setLive] = useState<LiveLotState>({ bidding: lot.bidding, my_registration: lot.my_registration, watching: lot.watching });
    const [offsetMs, setOffsetMs] = useState(() => clockOffset(lot.bidding.server_now, Date.now()));
    const ended = live.bidding.phase === 'ended';
    const inFlight = useRef(false);

    const apply = useCallback((state: Partial<LiveLotState>) => {
        setLive((previous) => ({ ...previous, ...state }));
        if (state.bidding?.server_now) {
            setOffsetMs(clockOffset(state.bidding.server_now, Date.now()));
        }
    }, []);

    useEffect(() => {
        if (ended) {
            return;
        }

        let timer: number | undefined;

        const poll = async () => {
            if (inFlight.current || document.visibilityState !== 'visible') {
                return;
            }
            inFlight.current = true;
            try {
                const result = await siteFetch<{ data: LiveLotState }>(`/auctions/${auctionId}/lots/${lot.id}/feed`);
                apply(result.data);
            } catch (failure) {
                const error = failure as SiteFetchError;
                if (error.status === 401 && error.loginUrl) {
                    window.location.href = error.loginUrl;
                }
            } finally {
                inFlight.current = false;
            }
        };

        const start = () => {
            window.clearInterval(timer);
            if (document.visibilityState === 'visible') {
                timer = window.setInterval(poll, POLL_MS);
            }
        };

        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                poll();
            }
            start();
        };

        start();
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            window.clearInterval(timer);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [ended, auctionId, lot.id, apply]);

    return { live, offsetMs, apply };
}

function BiddingActivity({ live }: { live: LiveLotState }) {
    const bids = live.bidding.recent_bids;
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 30000);

        return () => window.clearInterval(timer);
    }, []);

    if (!bids) {
        return null;
    }

    return (
        <section aria-labelledby="activity-heading">
            <h2 id="activity-heading" className="font-display text-ink text-2xl">
                Bidding activity
            </h2>
            {bids.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">No bids yet. Be the first.</p>
            ) : (
                <ul className="border-sand-dark mt-4 divide-y divide-[var(--color-sand-dark)] rounded-2xl border bg-white">
                    {bids.map((bid, index) => (
                        <li key={`${bid.at}-${index}`} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 text-sm">
                            <span className="text-ink font-semibold tabular-nums">{formatRand(bid.amount)}</span>
                            <span className="flex items-center gap-2 text-slate-600">
                                {bid.who !== null && bid.who !== undefined ? `Bidder #${bid.who}` : 'A bidder'}
                                {bid.mine && <span className="bg-ink rounded-full px-2 py-0.5 text-xs font-semibold text-white">You</span>}
                                {bid.highest && (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">Highest</span>
                                )}
                            </span>
                            <span className="w-full text-xs text-slate-500 sm:w-auto">{timeAgo(bid.at, now)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function LotPage({ lot, auctionId }: { lot: LotDetail; auctionId: string }) {
    const { live, offsetMs, apply } = useLiveLot(lot, auctionId);
    const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
    const photos = (lot.photos ?? []).filter((photo) => photoUrl(photo));
    const pill = lotPill(live.bidding.phase, live.bidding.lot_status ?? lot.status);
    const place = [lot.suburb, lot.city].filter(Boolean).join(', ');
    const guide = guidePrice(lot);
    const heroImage = photoUrl(photos[0]) ?? lot.image_url;

    return (
        <SiteLayout>
            <section className="relative">
                <button
                    type="button"
                    className="block w-full"
                    onClick={() => photos.length > 0 && setGalleryIndex(0)}
                    aria-label={photos.length > 0 ? `Open photo gallery for ${lot.title}` : undefined}
                    disabled={photos.length === 0}
                >
                    <CoverImage src={heroImage} alt="" className="h-[42vh] min-h-72 lg:h-[56vh]" />
                </button>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0">
                    <div className="mx-auto max-w-7xl px-4 pb-8 text-white sm:px-6 lg:pr-[440px]">
                        <PhasePill tone={pill.tone}>{pill.label}</PhasePill>
                        <p className="mt-3 text-sm font-medium tracking-wider text-white/80 uppercase">
                            {lot.lot_number !== null && `Lot ${lot.lot_number} · `}
                            {formatLabel(lot.auction.format)}
                        </p>
                        <h1 className="font-display mt-1 text-3xl leading-tight sm:text-4xl">{lot.title}</h1>
                        {place && (
                            <p className="mt-2 flex items-center gap-1.5 text-white/80">
                                <MapPin className="size-4" /> {place}
                            </p>
                        )}
                    </div>
                </div>
                {photos.length > 1 && (
                    <button
                        type="button"
                        onClick={() => setGalleryIndex(0)}
                        className="text-ink absolute top-4 right-4 flex min-h-11 items-center gap-2 rounded-full bg-white/95 px-4 text-sm font-semibold shadow"
                    >
                        <Images className="size-4" /> View all {photos.length} photos
                    </button>
                )}
            </section>

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
                <Link
                    href={`/auctions/${lot.auction.id}`}
                    className="text-brass-dark inline-flex min-h-11 items-center gap-1 text-sm font-medium hover:underline"
                >
                    <ArrowLeft className="size-4" /> {lot.auction.title}
                </Link>

                <div className="mt-4 grid gap-10 lg:grid-cols-[1fr_400px]">
                    <div className="order-2 grid content-start gap-10 lg:order-1">
                        {photos.length > 1 && (
                            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Photos">
                                {photos.slice(0, 8).map((photo, index) => (
                                    <li key={index}>
                                        <button
                                            type="button"
                                            onClick={() => setGalleryIndex(index)}
                                            className="block w-full overflow-hidden rounded-lg"
                                            aria-label={`Open photo ${index + 1} of ${photos.length}`}
                                        >
                                            <img
                                                src={photoUrl(photo) ?? ''}
                                                alt=""
                                                className="aspect-[4/3] w-full object-cover transition hover:scale-105"
                                                loading="lazy"
                                            />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <section aria-labelledby="about-heading">
                            <h2 id="about-heading" className="font-display text-ink text-2xl">
                                About this property
                            </h2>
                            <div className="mt-4">
                                <LotFacts
                                    lot={lot}
                                    extra={
                                        lot.floor_size_m2 ? (
                                            <li className="flex items-center gap-1.5">
                                                <Ruler className="text-brass-dark size-4" aria-hidden="true" /> {lot.floor_size_m2} m²
                                                <span className="sr-only">floor size</span>
                                            </li>
                                        ) : undefined
                                    }
                                />
                            </div>
                            {lot.description && <p className="mt-4 leading-relaxed whitespace-pre-line text-slate-700">{lot.description}</p>}
                            {guide && (
                                <p className="mt-4 text-sm text-slate-700">
                                    <span className="font-semibold">Guide price:</span> {guide}
                                </p>
                            )}
                        </section>

                        <BiddingActivity live={live} />

                        <section aria-labelledby="lot-documents-heading">
                            <h2 id="lot-documents-heading" className="font-display text-ink text-2xl">
                                Documents
                            </h2>
                            <div className="mt-4">
                                <DocumentList
                                    documents={lot.documents ?? []}
                                    hidden={lot.hidden_documents}
                                    baseUrl={`/auctions/${lot.auction.id}/lots/${lot.id}/documents`}
                                />
                            </div>
                        </section>

                        <EnquiryForm action={`/auctions/${lot.auction.id}/lots/${lot.id}/enquiries`} heading="Ask about this lot" />
                    </div>

                    <div className="order-1 lg:order-2 lg:-mt-48">
                        <div className="grid gap-4 lg:sticky lg:top-24">
                            <BidCard lot={lot} live={live} offsetMs={offsetMs} onUpdate={apply} />
                            {lot.fee_notice && <p className="text-xs leading-relaxed whitespace-pre-line text-slate-600">{lot.fee_notice}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <PhotoGallery photos={photos} title={lot.title} index={galleryIndex} onIndexChange={setGalleryIndex} />
        </SiteLayout>
    );
}
