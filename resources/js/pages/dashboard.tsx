import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, telHref } from '@/lib/site';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Building2, MessageSquare, PlugZap, Search, Unplug, Users } from 'lucide-react';
import { ReactNode } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    corex: {
        configured: boolean;
        connected: boolean;
        agencyName: string | null;
        liveAuctions: number | null;
        upcomingAuctions: number | null;
        sellFormEnabled: boolean;
    };
    stats: { contactEnquiries: number; users: number };
    recentEnquiries: { id: number; name: string; phone: string; subject: string; created_at: string | null }[];
}

function CorexStatus({ corex }: { corex: DashboardProps['corex'] }) {
    if (!corex.configured) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                <Unplug className="mt-0.5 size-5 shrink-0" />
                <div>
                    <p className="font-medium">CoreX is not connected yet</p>
                    <p className="text-sm">
                        Auctions, bidding and the Sell form need <code>COREX_AUCTIONS_API</code> and <code>COREX_API_KEY</code> in the server's .env
                        file.
                    </p>
                </div>
            </div>
        );
    }

    if (!corex.connected) {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-5 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100">
                <Unplug className="mt-0.5 size-5 shrink-0" />
                <div>
                    <p className="font-medium">CoreX is not responding</p>
                    <p className="text-sm">
                        Check the API address and key, and that the agency's website is set to live in CoreX. The server log has details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border p-5 text-sm">
            <span className="flex items-center gap-2 font-medium">
                <PlugZap className="size-5 text-emerald-600" /> Connected to CoreX{corex.agencyName ? ` as ${corex.agencyName}` : ''}
            </span>
            <span className="text-muted-foreground">
                {corex.liveAuctions} live · {corex.upcomingAuctions} upcoming auctions
            </span>
            <span className="text-muted-foreground">Sell form {corex.sellFormEnabled ? 'on' : 'off'}</span>
            <span className="text-muted-foreground">Auctions, buyers, bids and seller questionnaires are managed in CoreX.</span>
        </div>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: ReactNode }) {
    return (
        <div className="flex items-center gap-4 rounded-xl border p-5">
            <div className="bg-muted text-muted-foreground flex size-10 items-center justify-center rounded-lg">{icon}</div>
            <div>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
                <p className="text-muted-foreground text-sm">{label}</p>
            </div>
        </div>
    );
}

function RecentList({
    title,
    empty,
    rows,
}: {
    title: string;
    empty: string;
    rows: { id: number; primary: string; secondary: string; phone: string; date: string | null }[];
}) {
    return (
        <section className="rounded-xl border">
            <h2 className="border-b px-5 py-3 font-medium">{title}</h2>
            {rows.length === 0 ? (
                <p className="text-muted-foreground px-5 py-6 text-sm">{empty}</p>
            ) : (
                <ul className="divide-y">
                    {rows.map((row) => (
                        <li key={row.id} className="flex items-start justify-between gap-4 px-5 py-3 text-sm">
                            <div>
                                <p className="font-medium">{row.primary}</p>
                                <p className="text-muted-foreground">{row.secondary}</p>
                            </div>
                            <div className="text-right">
                                <a href={telHref(row.phone)} className="underline-offset-4 hover:underline">
                                    {row.phone}
                                </a>
                                <p className="text-muted-foreground text-xs">{formatDateTime(row.date)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function Dashboard({ corex, stats, recentEnquiries }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading title="Dashboard" description="An overview of website activity." />

                <CorexStatus corex={corex} />

                <div className="grid gap-4 sm:grid-cols-2">
                    <StatCard label="Contact form enquiries" value={stats.contactEnquiries} icon={<MessageSquare className="size-5" />} />
                    <StatCard label="Admin users" value={stats.users} icon={<Users className="size-5" />} />
                </div>

                <div className="grid gap-6">
                    <RecentList
                        title="Latest contact form enquiries"
                        empty="No enquiries yet."
                        rows={recentEnquiries.map((enquiry) => ({
                            id: enquiry.id,
                            primary: enquiry.name,
                            secondary: enquiry.subject,
                            phone: enquiry.phone,
                            date: enquiry.created_at,
                        }))}
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        { href: '/admin/site-settings', label: 'Website details', body: 'Phone numbers, emails and links', icon: Building2 },
                        { href: '/admin/seo', label: 'SEO', body: 'Titles, descriptions and analytics', icon: Search },
                        { href: '/admin/users', label: 'Users', body: 'Who can log in to this admin', icon: Users },
                    ].map(({ href, label, body, icon: Icon }) => (
                        <Link key={href} href={href} className="hover:bg-muted/50 flex items-center gap-3 rounded-xl border p-4 transition">
                            <Icon className="text-muted-foreground size-5" />
                            <div>
                                <p className="font-medium">{label}</p>
                                <p className="text-muted-foreground text-sm">{body}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
