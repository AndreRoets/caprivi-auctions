import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime, telHref } from '@/lib/site';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Building2, ClipboardList, Gavel, MessageSquare, Search, Users } from 'lucide-react';
import { ReactNode } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: { sellerSubmissions: number; contactEnquiries: number; lotsOnAuction: number; users: number };
    recentSubmissions: { id: number; name: string; phone: string; property_type: string; suburb: string; created_at: string | null }[];
    recentEnquiries: { id: number; name: string; phone: string; subject: string; created_at: string | null }[];
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

export default function Dashboard({ stats, recentSubmissions, recentEnquiries }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <Heading title="Dashboard" description="An overview of website activity." />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Seller questionnaires" value={stats.sellerSubmissions} icon={<ClipboardList className="size-5" />} />
                    <StatCard label="Contact enquiries" value={stats.contactEnquiries} icon={<MessageSquare className="size-5" />} />
                    <StatCard label="Lots on auction" value={stats.lotsOnAuction} icon={<Gavel className="size-5" />} />
                    <StatCard label="Admin users" value={stats.users} icon={<Users className="size-5" />} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <RecentList
                        title="Latest seller questionnaires"
                        empty="No questionnaires yet."
                        rows={recentSubmissions.map((submission) => ({
                            id: submission.id,
                            primary: submission.name,
                            secondary: `${submission.property_type} in ${submission.suburb}`,
                            phone: submission.phone,
                            date: submission.created_at,
                        }))}
                    />
                    <RecentList
                        title="Latest enquiries"
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
