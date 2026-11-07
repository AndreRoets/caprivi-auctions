import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Documents', href: '/admin/documents' }];

interface DocumentRow {
    id: number;
    title: string;
    original_name: string;
    size: number;
    access: string;
    is_published: boolean;
}

function formatSize(bytes: number): string {
    if (bytes >= 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function DocumentsIndex({ documents, accessOptions }: { documents: DocumentRow[]; accessOptions: Record<string, string> }) {
    const [deleting, setDeleting] = useState<DocumentRow | null>(null);
    const [processing, setProcessing] = useState(false);

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        router.delete(route('admin.documents.destroy', deleting.id), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setDeleting(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents" />

            <div className="max-w-4xl px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading
                        title="Documents"
                        description='Files shown in the "Auction documents" section of the home page. You choose who may download each one.'
                    />
                    <Button asChild>
                        <Link href={route('admin.documents.create')}>
                            <Plus /> Add document
                        </Link>
                    </Button>
                </div>

                {documents.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border p-6 text-sm">
                        No documents yet. Until you add one, the home page shows the standard "Request document" list instead.
                    </p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground text-left">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Document</th>
                                    <th className="px-4 py-3 font-medium">Who can download</th>
                                    <th className="hidden px-4 py-3 font-medium sm:table-cell">Status</th>
                                    <th className="px-4 py-3">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {documents.map((document) => (
                                    <tr key={document.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{document.title}</p>
                                            <p className="text-muted-foreground text-xs">
                                                {document.original_name} · {formatSize(document.size)}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">{accessOptions[document.access] ?? document.access}</td>
                                        <td className="hidden px-4 py-3 sm:table-cell">{document.is_published ? 'Visible' : 'Hidden'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('admin.documents.edit', document.id)} aria-label={`Edit ${document.title}`}>
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Delete ${document.title}`}
                                                    onClick={() => setDeleting(document)}
                                                >
                                                    <Trash2 className="text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
                <DialogContent>
                    <DialogTitle>Delete {deleting?.title}?</DialogTitle>
                    <DialogDescription>The file is removed from the website and the server. This cannot be undone.</DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" disabled={processing} onClick={confirmDelete}>
                            Delete document
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
