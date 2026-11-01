import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { formatDateTime } from '@/lib/site';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Users', href: '/admin/users' }];

interface UserRow {
    id: number;
    name: string;
    email: string;
    created_at: string | null;
}

export default function UsersIndex({ users }: { users: UserRow[] }) {
    const { auth } = usePage<SharedData>().props;
    const [deleting, setDeleting] = useState<UserRow | null>(null);
    const [processing, setProcessing] = useState(false);

    const confirmDelete = () => {
        if (!deleting) {
            return;
        }

        router.delete(route('admin.users.destroy', deleting.id), {
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
            <Head title="Users" />

            <div className="max-w-4xl px-4 py-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <Heading title="Users" description="Everyone listed here can log in and manage the website." />
                    <Button asChild>
                        <Link href={route('admin.users.create')}>
                            <Plus /> Add user
                        </Link>
                    </Button>
                </div>

                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground text-left">
                            <tr>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="hidden px-4 py-3 font-medium sm:table-cell">Added</th>
                                <th className="px-4 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3 font-medium">
                                        {user.name}
                                        {user.id === auth.user.id && <span className="text-muted-foreground ml-2 text-xs font-normal">(you)</span>}
                                    </td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="text-muted-foreground hidden px-4 py-3 sm:table-cell">{formatDateTime(user.created_at)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={route('admin.users.edit', user.id)} aria-label={`Edit ${user.name}`}>
                                                    <Pencil />
                                                </Link>
                                            </Button>
                                            {user.id !== auth.user.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label={`Delete ${user.name}`}
                                                    onClick={() => setDeleting(user)}
                                                >
                                                    <Trash2 className="text-red-600" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
                <DialogContent>
                    <DialogTitle>Delete {deleting?.name}?</DialogTitle>
                    <DialogDescription>They will no longer be able to log in. This cannot be undone.</DialogDescription>
                    <DialogFooter className="gap-2">
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                        <Button variant="destructive" disabled={processing} onClick={confirmDelete}>
                            Delete user
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
