import { CoverImage, formatLabel, LotCard, PhasePill } from '@/components/auctions/auction-card';
import DocumentList from '@/components/auctions/document-list';
import EnquiryForm from '@/components/auctions/enquiry-form';
import SiteLayout from '@/layouts/site-layout';
import { formatDateTime } from '@/lib/corex';
import { type SharedData } from '@/types';
import { type AuctionDetail } from '@/types/corex';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, MapPin, Video } from 'lucide-react';
import { ReactNode } from 'react';

function Fact({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div>
            <dt className="text-xs font-medium tracking-wider text-slate-500 uppercase">{label}</dt>
            <dd className="text-ink mt-0.5">{children}</dd>
        </div>
    );
}

function RegistrationCallout({ auction }: { auction: AuctionDetail }) {
    const { buyer } = usePage<SharedData>().props;
    const registration = auction.registration;
    const mine = registration?.mine;

    if (auction.phase === 'finished') {
        return null;
    }

    if (!buyer) {
        return (
            <div className="grid gap-2">
                <Link
                    href={`/account/signup?return=/auctions/${auction.id}`}
                    className="bg-brass text-ink flex min-h-11 items-center justify-center rounded-full px-6 font-semibold hover:bg-white"
                >
                    Sign up to bid
                </Link>
                <Link
                    href={`/account/login?return=/auctions/${auction.id}`}
                    className="flex min-h-11 items-center justify-center rounded-full border border-white/30 px-6 font-semibold hover:bg-white/10"
                >
                    Log in
                </Link>
            </div>
        );
    }

    if (mine?.status === 'approved') {
        return (
            <p className="rounded-lg bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100">
                You are registered{mine.bidder_number ? ` as bidder #${mine.bidder_number}` : ''}.
            </p>
        );
    }

    if (mine?.status === 'pending') {
        return <p className="rounded-lg bg-white/10 px-4 py-3 text-sm">Your registration is waiting for approval.</p>;
    }

    if (registration?.open) {
        return (
            <div className="grid gap-2">
                {mine?.status === 'declined' && (
                    <p className="rounded-lg bg-red-500/20 px-4 py-3 text-sm">
                        Your registration was declined{mine.declined_reason ? `: ${mine.declined_reason}` : '.'}
                    </p>
                )}
                <Link
                    href={`/auctions/${auction.id}/register`}
                    className="bg-brass text-ink flex min-h-11 items-center justify-center rounded-full px-6 font-semibold hover:bg-white"
                >
                    {mine?.status === 'declined' ? 'Update and register again' : 'Register to bid'}
                </Link>
            </div>
        );
    }

    return <p className="text-sm text-white/70">Registration for this auction is closed.</p>;
}

export default function AuctionShow({ auction }: { auction: AuctionDetail }) {
    const tone = auction.phase === 'live' ? 'live' : auction.phase === 'upcoming' ? 'upcoming' : 'ended';

    return (
        <SiteLayout>
            <section className="bg-ink relative overflow-hidden text-white">
                <CoverImage src={auction.image_url} alt="" className="absolute inset-0 h-full opacity-30" />
                <div className="from-ink via-ink/80 absolute inset-0 bg-gradient-to-r to-transparent" />
                <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_340px] lg:py-20">
                    <div>
                        <Link href="/auctions" className="text-brass inline-flex min-h-11 items-center gap-1 text-sm font-medium hover:underline">
                            <ArrowLeft className="size-4" /> All auctions
                        </Link>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <PhasePill tone={tone}>
                                {auction.phase === 'live'
                                    ? 'Live now'
                                    : auction.phase === 'upcoming'
                                      ? 'Upcoming'
                                      : (auction.phase_label ?? 'Finished')}
                            </PhasePill>
                            <span className="text-brass text-xs font-medium tracking-wider uppercase">
                                {formatLabel(auction.format)}
                                {auction.reference ? ` · ${auction.reference}` : ''}
                            </span>
                        </div>
                        <h1 className="font-display mt-4 text-4xl leading-tight sm:text-5xl">{auction.title}</h1>
                        {auction.description && <p className="mt-5 max-w-2xl whitespace-pre-line text-white/75">{auction.description}</p>}
                    </div>
                    <div className="self-end rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                        <RegistrationCallout auction={auction} />
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_360px]">
                <section aria-labelledby="lots-heading">
                    <h2 id="lots-heading" className="font-display text-ink text-3xl">
                        Lots
                    </h2>
                    {auction.lots.length === 0 ? (
                        <p className="mt-4 text-slate-600">Lots for this auction will be published soon.</p>
                    ) : (
                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            {auction.lots.map((lot) => (
                                <LotCard key={lot.id} lot={lot} auctionId={auction.id} />
                            ))}
                        </div>
                    )}
                </section>

                <aside className="grid content-start gap-8">
                    <section className="border-sand-dark rounded-2xl border bg-white p-6" aria-labelledby="when-heading">
                        <h2 id="when-heading" className="font-display text-ink text-xl">
                            When &amp; where
                        </h2>
                        <dl className="mt-4 grid gap-4 text-sm">
                            <Fact label="Starts">
                                <span className="flex items-center gap-1.5">
                                    <CalendarDays className="text-brass-dark size-4" /> {formatDateTime(auction.starts_at)}
                                </span>
                            </Fact>
                            {auction.ends_at && <Fact label="Closes">{formatDateTime(auction.ends_at)}</Fact>}
                            {(auction.venue_name || auction.venue_address) && (
                                <Fact label="Venue">
                                    <span className="flex items-start gap-1.5">
                                        <MapPin className="text-brass-dark mt-0.5 size-4 shrink-0" />
                                        <span>
                                            {auction.venue_name}
                                            {auction.venue_address && <span className="block text-slate-600">{auction.venue_address}</span>}
                                        </span>
                                    </span>
                                </Fact>
                            )}
                            {auction.registration?.closes_at && (
                                <Fact label="Registration closes">{formatDateTime(auction.registration.closes_at)}</Fact>
                            )}
                            {auction.stream_url && (
                                <Fact label="Watch live">
                                    <a
                                        href={auction.stream_url}
                                        target="_blank"
                                        rel="noopener"
                                        className="text-brass-dark inline-flex min-h-11 items-center gap-1.5 font-medium underline"
                                    >
                                        <Video className="size-4" /> Open the live stream
                                    </a>
                                </Fact>
                            )}
                        </dl>
                        {auction.fee_notice && (
                            <p className="border-sand-dark mt-5 border-t pt-4 text-xs leading-relaxed whitespace-pre-line text-slate-600">
                                {auction.fee_notice}
                            </p>
                        )}
                    </section>

                    <section aria-labelledby="documents-heading">
                        <h2 id="documents-heading" className="font-display text-ink text-xl">
                            Documents
                        </h2>
                        <div className="mt-4 [&_ul]:grid-cols-1">
                            <DocumentList
                                documents={auction.documents ?? []}
                                hidden={auction.hidden_documents}
                                baseUrl={`/auctions/${auction.id}/documents`}
                            />
                        </div>
                    </section>

                    <EnquiryForm action={`/auctions/${auction.id}/enquiries`} heading="Ask about this auction" />
                </aside>
            </div>
        </SiteLayout>
    );
}
