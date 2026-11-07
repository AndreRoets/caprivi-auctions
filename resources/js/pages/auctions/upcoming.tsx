import { AuctionCard } from '@/components/auctions/auction-card';
import SiteLayout from '@/layouts/site-layout';
import { telHref, useSite } from '@/lib/site';
import { type SharedData } from '@/types';
import { type AuctionCard as AuctionCardData, type CorexSite } from '@/types/corex';
import { Link, usePage } from '@inertiajs/react';

interface UpcomingAuctionsProps {
    corexSite: CorexSite | null;
    upcomingAuctions: AuctionCardData[];
}

export default function UpcomingAuctions({ corexSite, upcomingAuctions }: UpcomingAuctionsProps) {
    const { buyer } = usePage<SharedData>().props;
    const site = useSite();

    return (
        <SiteLayout>
            <section className="bg-ink relative overflow-hidden text-white">
                <div className="bg-brass/20 pointer-events-none absolute -top-24 -right-24 size-96 rounded-full blur-3xl" />
                <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
                    <p className="text-brass text-sm tracking-[0.2em] uppercase">Coming up</p>
                    <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight sm:text-5xl">Upcoming auctions</h1>
                    <p className="mt-5 max-w-2xl text-lg text-white/75">
                        Browse the auctions opening soon. Register early so you are approved and ready to bid when the auction starts.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        {!buyer && (
                            <Link
                                href="/account/signup?return=/auctions/upcoming"
                                className="bg-brass text-ink inline-flex min-h-11 items-center rounded-full px-6 font-medium hover:bg-white"
                            >
                                Sign up to bid
                            </Link>
                        )}
                        <Link
                            href="/auctions"
                            className="inline-flex min-h-11 items-center rounded-full border border-white/30 px-6 font-medium hover:bg-white/10"
                        >
                            All auctions
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="upcoming-heading">
                <h2 id="upcoming-heading" className="sr-only">
                    Upcoming auctions
                </h2>
                {!corexSite ? (
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-display text-ink text-2xl">Auctions are temporarily unavailable</h2>
                        <p className="mt-3 text-slate-600">
                            Please try again in a few minutes, or call us on{' '}
                            <a href={telHref(site.main_phone)} className="text-brass-dark font-medium underline">
                                {site.main_phone}
                            </a>
                            .
                        </p>
                    </div>
                ) : upcomingAuctions.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {upcomingAuctions.map((auction) => (
                            <AuctionCard key={auction.id} auction={auction} />
                        ))}
                    </div>
                ) : (
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-slate-600">
                            No upcoming auctions are scheduled right now. New auctions are announced here, so check back soon.
                        </p>
                        <Link href="/auctions" className="text-brass-dark mt-4 inline-flex min-h-11 items-center font-medium hover:underline">
                            See all auctions →
                        </Link>
                    </div>
                )}
            </section>
        </SiteLayout>
    );
}
