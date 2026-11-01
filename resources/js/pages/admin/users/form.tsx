import AdminField from '@/components/admin-field';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface EditableUser {
    id: number;
    name: string;
    email: string;
}

export default function UserForm({ user }: { user: EditableUser | null }) {
    const isEditing = user !== null;
    const title = isEditing ? `Edit ${user.name}` : 'Add user';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Users', href: '/admin/users' },
        { title, href: isEditing ? `/admin/users/${user.id}/edit` : '/admin/users/create' },
    ];

    const { data, setData, post, put, errors, processing } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        if (isEditing) {
            put(route('admin.users.update', user.id));
        } else {
            post(route('admin.users.store'));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <form onSubmit={submit} className="max-w-xl space-y-6 px-4 py-6">
                <Heading
                    title={title}
                    description={
                        isEditing
                            ? 'Update their details. Leave the password blank to keep it unchanged.'
                            : 'They will be able to log in straight away.'
                    }
                />

                <AdminField id="name" label="Full name" error={errors.name}>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoComplete="off" />
                </AdminField>

                <AdminField id="email" label="Email address" error={errors.email} hint="Used to log in.">
                    <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="off"
                    />
                </AdminField>

                <div className="grid gap-5 sm:grid-cols-2">
                    <AdminField id="password" label={isEditing ? 'New password' : 'Password'} error={errors.password}>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required={!isEditing}
                            autoComplete="new-password"
                        />
                    </AdminField>
                    <AdminField id="password_confirmation" label="Confirm password" error={errors.password_confirmation}>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required={!isEditing}
                            autoComplete="new-password"
                        />
                    </AdminField>
                </div>

                <div className="flex items-center gap-3">
                    <Button disabled={processing}>{isEditing ? 'Save changes' : 'Create user'}</Button>
                    <Button variant="ghost" asChild>
                        <Link href={route('admin.users.index')}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
