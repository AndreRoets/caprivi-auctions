import AdminField from '@/components/admin-field';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface EditableDocument {
    id: number;
    title: string;
    description: string | null;
    access: string;
    sort_order: number;
    is_published: boolean;
    original_name: string;
}

export default function DocumentForm({ document, accessOptions }: { document: EditableDocument | null; accessOptions: Record<string, string> }) {
    const isEditing = document !== null;
    const title = isEditing ? `Edit ${document.title}` : 'Add document';
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Documents', href: '/admin/documents' },
        { title, href: isEditing ? `/admin/documents/${document.id}/edit` : '/admin/documents/create' },
    ];

    const { data, setData, post, errors, processing } = useForm<{
        _method: string;
        title: string;
        description: string;
        access: string;
        sort_order: number;
        is_published: boolean;
        file: File | null;
    }>({
        _method: isEditing ? 'put' : 'post',
        title: document?.title ?? '',
        description: document?.description ?? '',
        access: document?.access ?? 'everyone',
        sort_order: document?.sort_order ?? 0,
        is_published: document?.is_published ?? true,
        file: null,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(isEditing ? route('admin.documents.update', document.id) : route('admin.documents.store'), { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <form onSubmit={submit} className="max-w-xl space-y-6 px-4 py-6">
                <Heading title={title} description="This document appears in the Auction documents section of the home page." />

                <AdminField id="title" label="Title" error={errors.title}>
                    <Input id="title" value={data.title} onChange={(e) => setData('title', e.target.value)} required />
                </AdminField>

                <AdminField id="description" label="Short description" error={errors.description} hint="Optional. One line shown under the title.">
                    <Textarea id="description" rows={2} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                </AdminField>

                <AdminField
                    id="file"
                    label={isEditing ? 'Replace file' : 'File'}
                    error={errors.file}
                    hint={
                        isEditing
                            ? `Current file: ${document.original_name}. Leave empty to keep it. PDF, Word, Excel, PowerPoint, text, zip or image, up to 20 MB.`
                            : 'PDF, Word, Excel, PowerPoint, text, zip or image, up to 20 MB.'
                    }
                >
                    <Input id="file" type="file" required={!isEditing} onChange={(e) => setData('file', e.target.files?.[0] ?? null)} />
                </AdminField>

                <fieldset className="grid gap-2">
                    <legend className="mb-1 text-sm font-medium">Who can download it</legend>
                    {Object.entries(accessOptions).map(([value, label]) => (
                        <label key={value} className="flex items-center gap-3 rounded-lg border p-3 text-sm">
                            <input
                                type="radio"
                                name="access"
                                value={value}
                                checked={data.access === value}
                                onChange={() => setData('access', value)}
                            />
                            {label}
                        </label>
                    ))}
                    {errors.access && <p className="text-sm text-red-600">{errors.access}</p>}
                    <p className="text-muted-foreground text-xs">
                        Signed-in buyers are visitors with an account on the website. Others are sent to the login page and brought back to the
                        download afterwards.
                    </p>
                </fieldset>

                <AdminField id="sort_order" label="Order" error={errors.sort_order} hint="Lower numbers appear first.">
                    <Input
                        id="sort_order"
                        type="number"
                        min={0}
                        value={data.sort_order}
                        onChange={(e) => setData('sort_order', Number(e.target.value))}
                        className="w-32"
                    />
                </AdminField>

                <div className="flex items-center gap-3">
                    <Checkbox
                        id="is_published"
                        checked={data.is_published}
                        onCheckedChange={(checked) => setData('is_published', checked === true)}
                    />
                    <Label htmlFor="is_published">Show on the website</Label>
                </div>

                <div className="flex items-center gap-3">
                    <Button disabled={processing}>{isEditing ? 'Save changes' : 'Add document'}</Button>
                    <Button variant="ghost" asChild>
                        <Link href={route('admin.documents.index')}>Cancel</Link>
                    </Button>
                </div>
            </form>
        </AppLayout>
    );
}
