import AdminField, { linesToList, listError } from '@/components/admin-field';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SiteSettings } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Website details', href: '/admin/site-settings' }];

type EditableSettings = Omit<SiteSettings, 'phones'>;

type FormValues = {
    [Key in keyof EditableSettings]: string;
};

const socialFields: { key: keyof FormValues; label: string; placeholder: string }[] = [
    { key: 'facebook_url', label: 'Facebook page', placeholder: 'https://facebook.com/…' },
    { key: 'instagram_url', label: 'Instagram', placeholder: 'https://instagram.com/…' },
    { key: 'linkedin_url', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/…' },
    { key: 'youtube_url', label: 'YouTube', placeholder: 'https://youtube.com/@…' },
];

export default function SiteSettingsPage({ settings }: { settings: EditableSettings }) {
    const form = useForm<FormValues>({
        company_name: settings.company_name,
        tagline: settings.tagline ?? '',
        legal_name: settings.legal_name,
        address: settings.address,
        main_phone: settings.main_phone,
        mobile_phone: settings.mobile_phone ?? '',
        extra_phones: settings.extra_phones.join('\n'),
        whatsapp: settings.whatsapp ?? '',
        emails: settings.emails.join('\n'),
        parent_site_url: settings.parent_site_url ?? '',
        facebook_url: settings.facebook_url ?? '',
        instagram_url: settings.instagram_url ?? '',
        linkedin_url: settings.linkedin_url ?? '',
        youtube_url: settings.youtube_url ?? '',
    });
    const { data, setData, errors, processing } = form;
    const allErrors = errors as Record<string, string | undefined>;

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        form.transform((values) => ({
            ...values,
            extra_phones: linesToList(values.extra_phones),
            emails: linesToList(values.emails),
        }));

        form.put(route('admin.site-settings.update'), { preserveScroll: true, onSuccess: () => form.setDefaults() });
    };

    const text = (key: keyof FormValues, props: React.ComponentProps<typeof Input> = {}) => (
        <Input id={key} value={data[key]} onChange={(e) => setData(key, e.target.value)} {...props} />
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Website details" />

            <form onSubmit={submit} className="max-w-3xl space-y-10 px-4 py-6">
                <Heading
                    title="Website details"
                    description="The company name, phone numbers, email addresses and links shown across the public website."
                />

                <section className="space-y-5">
                    <HeadingSmall title="Business" />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <AdminField id="company_name" label="Company name" error={errors.company_name}>
                            {text('company_name', { required: true })}
                        </AdminField>
                        <AdminField id="tagline" label="Tagline" error={errors.tagline} hint="Shown under the logo.">
                            {text('tagline')}
                        </AdminField>
                    </div>
                    <AdminField id="legal_name" label="Registered / legal name" error={errors.legal_name} hint="Shown in the footer.">
                        {text('legal_name', { required: true })}
                    </AdminField>
                    <AdminField id="address" label="Physical address" error={errors.address}>
                        {text('address', { required: true })}
                    </AdminField>
                </section>

                <section className="space-y-5">
                    <HeadingSmall title="Phone numbers" description="The main number appears in the header and on every “Call” button." />
                    <div className="grid gap-5 sm:grid-cols-3">
                        <AdminField id="main_phone" label="Main number" error={errors.main_phone}>
                            {text('main_phone', { required: true, type: 'tel' })}
                        </AdminField>
                        <AdminField id="mobile_phone" label="Mobile number" error={errors.mobile_phone}>
                            {text('mobile_phone', { type: 'tel' })}
                        </AdminField>
                        <AdminField id="whatsapp" label="WhatsApp number" error={errors.whatsapp}>
                            {text('whatsapp', { type: 'tel' })}
                        </AdminField>
                    </div>
                    <AdminField
                        id="extra_phones"
                        label="Other numbers"
                        error={listError(allErrors, 'extra_phones')}
                        hint="One per line. Listed in the footer after the main and mobile numbers."
                    >
                        <Textarea id="extra_phones" rows={3} value={data.extra_phones} onChange={(e) => setData('extra_phones', e.target.value)} />
                    </AdminField>
                </section>

                <section className="space-y-5">
                    <HeadingSmall title="Email" />
                    <AdminField
                        id="emails"
                        label="Email addresses"
                        error={listError(allErrors, 'emails')}
                        hint="One per line. The first address is the main contact email."
                    >
                        <Textarea id="emails" rows={3} value={data.emails} onChange={(e) => setData('emails', e.target.value)} />
                    </AdminField>
                </section>

                <section className="space-y-5">
                    <HeadingSmall title="Links" />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <AdminField id="parent_site_url" label="Parent company website" error={errors.parent_site_url}>
                            {text('parent_site_url', { type: 'url' })}
                        </AdminField>
                        {socialFields.map((field) => (
                            <AdminField key={field.key} id={field.key} label={field.label} error={allErrors[field.key]}>
                                {text(field.key, { type: 'url', placeholder: field.placeholder })}
                            </AdminField>
                        ))}
                    </div>
                    <p className="text-muted-foreground text-xs">Social links that are filled in appear as icons in the website footer.</p>
                </section>

                <div className="bg-background sticky bottom-0 flex items-center gap-4 border-t py-4">
                    <Button disabled={processing}>{processing ? 'Saving…' : 'Save changes'}</Button>
                    {form.isDirty && <span className="text-muted-foreground text-sm">You have unsaved changes.</span>}
                </div>
            </form>
        </AppLayout>
    );
}
