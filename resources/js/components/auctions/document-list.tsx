import { type SharedData } from '@/types';
import { type CorexDocument } from '@/types/corex';
import { Link, usePage } from '@inertiajs/react';
import { FileText, Lock } from 'lucide-react';

interface DocumentListProps {
    documents: CorexDocument[];
    hidden: number | null | undefined;
    /** Base URL of this website's download route, e.g. /auctions/5/documents */
    baseUrl: string;
}

export default function DocumentList({ documents, hidden, baseUrl }: DocumentListProps) {
    const { buyer } = usePage<SharedData>().props;
    const hiddenCount = hidden ?? 0;

    if (documents.length === 0 && hiddenCount === 0) {
        return <p className="text-sm text-slate-500">No documents have been published yet.</p>;
    }

    const returnTo = typeof window === 'undefined' ? '' : encodeURIComponent(window.location.pathname);

    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {documents.map((document) => (
                <li key={document.id}>
                    <a
                        href={`${baseUrl}/${document.id}`}
                        className="border-sand-dark hover:bg-sand flex min-h-11 items-center gap-3 rounded-xl border bg-white p-4 text-sm font-medium"
                    >
                        <FileText className="text-brass-dark size-5 shrink-0" aria-hidden="true" />
                        <span>{document.name}</span>
                    </a>
                </li>
            ))}
            {hiddenCount > 0 && (
                <li>
                    <div className="border-sand-dark flex min-h-11 items-center gap-3 rounded-xl border border-dashed p-4 text-sm text-slate-600">
                        <Lock className="text-brass-dark size-5 shrink-0" aria-hidden="true" />
                        {buyer ? (
                            <span>
                                {hiddenCount} more {hiddenCount === 1 ? 'document is' : 'documents are'} available once you are registered for this
                                auction.
                            </span>
                        ) : (
                            <Link href={`/account/login?return=${returnTo}`} className="text-brass-dark font-medium underline">
                                Log in to see {hiddenCount} more {hiddenCount === 1 ? 'document' : 'documents'}
                            </Link>
                        )}
                    </div>
                </li>
            )}
        </ul>
    );
}
