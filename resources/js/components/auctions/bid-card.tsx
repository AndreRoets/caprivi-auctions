import {
    addToBid,
    bidError,
    formatAmountInput,
    formatCountdown,
    formatDateTime,
    formatRand,
    groupThousands,
    quickIncrements,
    secondsUntil,
    stripNumber,
} from '@/lib/corex';
import { siteFetch, type SiteFetchError } from '@/lib/site';
import { type SharedData } from '@/types';
import { type LiveLotState, type LotDetail } from '@/types/corex';
import { Link, usePage } from '@inertiajs/react';
import { Bookmark, BookmarkCheck, CheckCircle2, Clock, Hourglass, TriangleAlert } from 'lucide-react';
import { FormEventHandler, useEffect, useId, useState } from 'react';

interface BidCardProps {
    lot: LotDetail;
    live: LiveLotState;
    /** Server clock minus visitor clock, in ms. */
    offsetMs: number;
    onUpdate: (state: Partial<LiveLotState>) => void;
}

function useNow(enabled: boolean): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const timer = window.setInterval(() => setNow(Date.now()), 1000);

        return () => window.clearInterval(timer);
    }, [enabled]);

    return now;
}

function handleFailure(error: unknown, setMessage: (message: string) => void) {
    const failure = error as SiteFetchError;

    if (failure.status === 401 && failure.loginUrl) {
        window.location.href = failure.loginUrl;

        return;
    }

    setMessage(failure.message ?? 'Something went wrong. Please try again.');
}

function BiddingClock({ lot, live, offsetMs }: Omit<BidCardProps, 'onUpdate'>) {
    const { bidding } = live;
    const ticking = bidding.phase === 'open' && lot.auction.format !== 'live';
    const now = useNow(ticking);

    if (bidding.phase === 'upcoming') {
        return (
            <p className="flex items-center gap-2 text-sm text-slate-600">
                <Hourglass className="text-brass-dark size-4" /> Opens {formatDateTime(bidding.opens_at)}
            </p>
        );
    }

    if (bidding.phase === 'ended') {
        return <p className="text-sm font-medium text-slate-600">Bidding has closed.</p>;
    }

    if (lot.auction.format === 'live') {
        return <p className="text-sm font-semibold text-emerald-700">Bidding is open</p>;
    }

    const seconds = secondsUntil(bidding.closes_at, offsetMs, now);

    return (
        <p className="flex items-center gap-2 text-sm text-slate-700" role="timer" aria-live="off">
            <Clock className="text-brass-dark size-4" />
            {seconds === null ? (
                'Bidding is open'
            ) : seconds > 0 ? (
                <>
                    Closes in <strong className="tabular-nums">{formatCountdown(seconds)}</strong>
                </>
            ) : (
                'Closing…'
            )}
        </p>
    );
}

function BidBox({ lot, live, onUpdate }: Omit<BidCardProps, 'offsetMs'>) {
    const { bidding } = live;
    const inputId = useId();
    const autoId = useId();
    const [amount, setAmount] = useState(() => groupThousands(bidding.min_next));
    const [touched, setTouched] = useState(false);
    const [autoMax, setAutoMax] = useState('');
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    // Follow the minimum next bid as others bid, until the visitor changes the amount.
    useEffect(() => {
        if (!touched) {
            setAmount(groupThousands(bidding.min_next));
        }
    }, [bidding.min_next, touched]);

    const error = bidError(amount, bidding.min_next);

    const run = async (request: () => Promise<{ data: LiveLotState | null }>, after?: () => void) => {
        setBusy(true);
        setMessage(null);
        try {
            const result = await request();
            if (result.data) {
                onUpdate(result.data);
            }
            after?.();
        } catch (failure) {
            handleFailure(failure, setMessage);
        } finally {
            setBusy(false);
        }
    };

    const placeBid: FormEventHandler = (event) => {
        event.preventDefault();
        if (bidError(amount, bidding.min_next)) {
            setTouched(true);

            return;
        }
        run(
            () => siteFetch(`/lots/${lot.id}/bids`, { method: 'POST', body: { amount: stripNumber(amount) } }),
            () => setTouched(false),
        );
    };

    return (
        <div className="grid gap-4">
            <form onSubmit={placeBid} className="grid gap-3" noValidate>
                <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
                    Your bid
                </label>
                <div className="focus-within:border-brass focus-within:ring-brass/30 flex items-center rounded-xl border border-slate-300 bg-white focus-within:ring-2">
                    <span className="pl-4 font-semibold text-slate-500">R</span>
                    <input
                        id={inputId}
                        inputMode="numeric"
                        autoComplete="off"
                        className="text-ink min-h-12 w-full rounded-xl bg-transparent px-2 text-lg font-semibold tabular-nums outline-none"
                        value={amount}
                        onChange={(event) => {
                            setTouched(true);
                            setAmount(formatAmountInput(event.target.value));
                        }}
                        aria-invalid={error !== null}
                        aria-describedby={error ? `${inputId}-error` : undefined}
                    />
                </div>
                {error && (
                    <p id={`${inputId}-error`} className="text-sm font-medium text-red-600">
                        {error}
                    </p>
                )}
                <div className="flex flex-wrap gap-2">
                    {quickIncrements(bidding.increment).map((step) => (
                        <button
                            key={step}
                            type="button"
                            onClick={() => {
                                setTouched(true);
                                setAmount(groupThousands(addToBid(amount, bidding.min_next, step)));
                            }}
                            className="border-sand-dark hover:border-ink min-h-11 rounded-full border bg-white px-3 text-sm font-medium tabular-nums"
                        >
                            + {groupThousands(step)}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => {
                            setTouched(false);
                            setAmount(groupThousands(bidding.min_next));
                        }}
                        className="border-sand-dark hover:border-ink min-h-11 rounded-full border bg-white px-3 text-sm font-medium"
                    >
                        Minimum
                    </button>
                </div>
                <button
                    type="submit"
                    disabled={busy || error !== null}
                    className="bg-ink hover:bg-ink-soft min-h-12 rounded-full px-6 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {busy ? 'Placing bid…' : 'Place bid'}
                </button>
            </form>

            <div className="border-sand-dark grid gap-2 border-t pt-4">
                <p className="text-sm font-medium text-slate-700">Bid automatically up to a maximum</p>
                {bidding.your_auto_bid ? (
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span>
                            Your auto-bid maximum is <strong>{formatRand(bidding.your_auto_bid)}</strong>
                        </span>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => run(() => siteFetch(`/lots/${lot.id}/auto-bid`, { method: 'DELETE' }))}
                            className="text-brass-dark min-h-11 font-medium underline"
                        >
                            Cancel auto-bid
                        </button>
                    </div>
                ) : (
                    <form
                        className="flex gap-2"
                        onSubmit={(event) => {
                            event.preventDefault();
                            const max = stripNumber(autoMax);
                            if (max === null || max < bidding.min_next) {
                                setMessage(`Your maximum must be at least ${formatRand(bidding.min_next)}.`);

                                return;
                            }
                            run(
                                () => siteFetch(`/lots/${lot.id}/auto-bid`, { method: 'POST', body: { max } }),
                                () => setAutoMax(''),
                            );
                        }}
                    >
                        <label htmlFor={autoId} className="sr-only">
                            Auto-bid maximum
                        </label>
                        <input
                            id={autoId}
                            inputMode="numeric"
                            placeholder={`e.g. ${groupThousands(bidding.min_next + bidding.increment * 5)}`}
                            className="focus:border-brass focus:ring-brass/30 min-h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-sm tabular-nums outline-none focus:ring-2"
                            value={autoMax}
                            onChange={(event) => setAutoMax(formatAmountInput(event.target.value))}
                        />
                        <button
                            type="submit"
                            disabled={busy}
                            className="border-ink text-ink hover:bg-ink min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium hover:text-white"
                        >
                            Set
                        </button>
                    </form>
                )}
            </div>

            {message && (
                <p className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {message}
                </p>
            )}
        </div>
    );
}

export default function BidCard({ lot, live, offsetMs, onUpdate }: BidCardProps) {
    const { buyer } = usePage<SharedData>().props;
    const { bidding, my_registration: registration } = live;
    const [watchMessage, setWatchMessage] = useState<string | null>(null);
    const returnTo = typeof window === 'undefined' ? '' : encodeURIComponent(window.location.pathname);
    const hasBids = bidding.current_bid !== null;

    const toggleWatch = async () => {
        setWatchMessage(null);
        try {
            const result = await siteFetch<{ watching: boolean | null }>(`/lots/${lot.id}/watch`, { method: 'POST' });
            onUpdate({ watching: Boolean(result.watching) });
        } catch (failure) {
            handleFailure(failure, setWatchMessage);
        }
    };

    return (
        <section className="border-sand-dark grid gap-5 rounded-2xl border bg-white p-6 shadow-lg" aria-labelledby="bid-card-heading">
            <div>
                <h2 id="bid-card-heading" className="text-sm text-slate-500">
                    {hasBids ? 'Current bid' : 'Opening bid'}
                </h2>
                <p className="font-display text-ink text-4xl tabular-nums" aria-live="polite">
                    {formatRand(hasBids ? bidding.current_bid : (bidding.opening_bid ?? lot.opening_bid))}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    {bidding.bid_count !== undefined && (
                        <span>
                            {bidding.bid_count} {bidding.bid_count === 1 ? 'bid' : 'bids'}
                        </span>
                    )}
                    {bidding.reserve !== null && (
                        <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                bidding.reserve === 'met' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                            {bidding.reserve === 'met' ? 'Reserve met' : 'Reserve not met'}
                        </span>
                    )}
                </div>
            </div>

            <BiddingClock lot={lot} live={live} offsetMs={offsetMs} />

            {bidding.you === 'winning' && (
                <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800" role="status">
                    <CheckCircle2 className="size-4" /> You are the highest bidder.
                </p>
            )}
            {bidding.you === 'outbid' && (
                <p className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900" role="status">
                    <TriangleAlert className="size-4" /> You have been outbid.
                </p>
            )}

            {!buyer ? (
                bidding.phase !== 'ended' && (
                    <div className="grid gap-2">
                        <Link
                            href={`/account/login?return=${returnTo}`}
                            className="bg-ink hover:bg-ink-soft flex min-h-12 items-center justify-center rounded-full px-6 font-semibold text-white"
                        >
                            Login to bid
                        </Link>
                        <Link
                            href={`/account/signup?return=${returnTo}`}
                            className="border-ink text-ink hover:bg-sand flex min-h-12 items-center justify-center rounded-full border px-6 font-semibold"
                        >
                            Create a free account
                        </Link>
                    </div>
                )
            ) : !registration ? (
                bidding.phase !== 'ended' &&
                (lot.auction.registration_open ? (
                    <Link
                        href={`/auctions/${lot.auction.id}/register`}
                        className="bg-ink hover:bg-ink-soft flex min-h-12 items-center justify-center rounded-full px-6 font-semibold text-white"
                    >
                        Register to bid
                    </Link>
                ) : (
                    <p className="text-sm text-slate-600">Registration for this auction is closed.</p>
                ))
            ) : registration.status === 'pending' ? (
                <p className="bg-sand rounded-lg px-3 py-2 text-sm text-slate-700">Your registration is waiting for approval.</p>
            ) : registration.status === 'declined' ? (
                <div className="grid gap-2 rounded-lg bg-red-50 px-3 py-3 text-sm text-red-800">
                    <p className="font-semibold">Your registration was declined.</p>
                    {registration.declined_reason && <p>{registration.declined_reason}</p>}
                    <Link href={`/auctions/${lot.auction.id}/register`} className="font-semibold underline">
                        Update and register again
                    </Link>
                </div>
            ) : registration.status === 'approved' ? (
                <div className="grid gap-4">
                    {registration.bidder_number !== null && registration.bidder_number !== undefined && (
                        <p className="text-sm font-medium text-slate-700">You are bidder #{registration.bidder_number}</p>
                    )}
                    {bidding.phase === 'open' && <BidBox lot={lot} live={live} onUpdate={onUpdate} />}
                </div>
            ) : (
                <p className="text-sm text-slate-600">Your registration status: {registration.status}</p>
            )}

            {buyer && (
                <button
                    type="button"
                    onClick={toggleWatch}
                    aria-pressed={live.watching}
                    className="border-sand-dark hover:bg-sand flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium"
                >
                    {live.watching ? <BookmarkCheck className="text-brass-dark size-4" /> : <Bookmark className="size-4" />}
                    {live.watching ? 'Watching this lot' : 'Watch this lot'}
                </button>
            )}
            {watchMessage && <p className="text-sm text-red-600">{watchMessage}</p>}
        </section>
    );
}
