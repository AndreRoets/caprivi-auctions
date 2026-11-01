import AdminField from '@/components/admin-field';
import Heading from '@/components/heading';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'SEO', href: '/admin/seo' }];

type PageMeta = { title: string; description: string };

interface SeoSettings {
    seo_description: string;
    seo_keywords: string | null;
    seo_allow_indexing: boolean;
    seo_twitter_handle: string | null;
    seo_google_verification: string | null;
    seo_bing_verification: string | null;
    seo_google_analytics_id: string | null;
    seo_google_tag_manager_id: string | null;
    seo_pages: Record<string, PageMeta>;
}

interface SeoPageProps {
    settings: SeoSettings;
    pages: Record<string, string>;
    imageUrl: string;
    hasCustomImage: boolean;
    sitemapUrl: string;
    robotsUrl: string;
}

type FormValues = {
    seo_description: string;
    seo_keywords: string;
    seo_allow_indexing: boolean;
    seo_twitter_handle: string;
    seo_google_verification: string;
    seo_bing_verification: string;
    seo_google_analytics_id: string;
    seo_google_tag_manager_id: string;
    seo_pages: Record<string, PageMeta>;
    seo_image: File | null;
    remove_seo_image: boolean;
};

function CharacterCount({ value, limit }: { value: string; limit: number }) {
    return (
        <span className={value.length > limit ? 'text-amber-600' : ''}>
            {value.length} / {limit} characters
        </span>
    );
}

function SearchPreview({ title, description, url }: { title: string; description: string; url: string }) {
    return (
        <div className="rounded-lg border bg-white p-4 text-left dark:bg-neutral-950">
            <p className="text-xs text-neutral-500">Google search preview</p>
            <p className="mt-2 truncate text-sm text-neutral-700 dark:text-neutral-300">{url}</p>
            <p className="truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{title}</p>
            <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
        </div>
    );
}

export default function SeoSettingsPage({ settings, pages, imageUrl, hasCustomImage, sitemapUrl, robotsUrl }: SeoPageProps) {
    const { site } = usePage<SharedData>().props;
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const form = useForm<FormValues>({
        seo_description: settings.seo_description,
        seo_keywords: settings.seo_keywords ?? '',
        seo_allow_indexing: settings.seo_allow_indexing,
        seo_twitter_handle: settings.seo_twitter_handle ?? '',
        seo_google_verification: settings.seo_google_verification ?? '',
        seo_bing_verification: settings.seo_bing_verification ?? '',
        seo_google_analytics_id: settings.seo_google_analytics_id ?? '',
        seo_google_tag_manager_id: settings.seo_google_tag_manager_id ?? '',
        seo_pages: settings.seo_pages,
        seo_image: null,
        remove_seo_image: false,
    });
    const { data, setData, processing } = form;
    const errors = form.errors as Record<string, string | undefined>;
    const origin = sitemapUrl.replace(/\/sitemap\.xml$/, '');

    const setPageMeta = (page: string, field: keyof PageMeta, value: string) => {
        setData('seo_pages', { ...data.seo_pages, [page]: { ...data.seo_pages[page], [field]: value } });
    };

    const chooseImage = (file: File | null) => {
        setData((values) => ({ ...values, seo_image: file, remove_seo_image: false }));
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        form.post(route('admin.seo.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setImagePreview(null);
                form.setData((values) => ({ ...values, seo_image: null, remove_seo_image: false }));
            },
        });
    };

    const shownImage = imagePreview ?? (data.remove_seo_image ? '/images/caprivi-logo.png' : imageUrl);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SEO" />

            <form onSubmit={submit} className="max-w-3xl space-y-10 px-4 py-6">
                <Heading
                    title="Search engine optimisation"
                    description="Control how the website appears in Google, on social media and in link previews."
                />

                <section className="space-y-5">
                    <HeadingSmall title="Search visibility" />
                    <div className="flex items-start gap-3 rounded-lg border p-4">
                        <Checkbox
                            id="seo_allow_indexing"
                            checked={data.seo_allow_indexing}
                            onCheckedChange={(checked) => setData('seo_allow_indexing', checked === true)}
                        />
                        <div className="grid gap-1">
                            <Label htmlFor="seo_allow_indexing">Allow search engines to index the website</Label>
                            <p className="text-muted-foreground text-xs">
                                Turn this off while the site is being tested. Search engines are then asked not to list any page.
                            </p>
                        </div>
                    </div>
                    <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
                        <a href={sitemapUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline">
                            sitemap.xml <ExternalLink className="size-3" />
                        </a>
                        <a href={robotsUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline">
                            robots.txt <ExternalLink className="size-3" />
                        </a>
                        <span>Both update automatically. Submit the sitemap in Google Search Console.</span>
                    </div>
                </section>

                <section className="space-y-5">
                    <HeadingSmall
                        title="Pages"
                        description={`Each title is followed by “ - ${site.company_name}” in the browser tab and search results.`}
                    />
                    {Object.entries(pages).map(([page, label]) => {
                        const meta = data.seo_pages[page];

                        return (
                            <div key={page} className="grid gap-4 rounded-lg border p-4">
                                <p className="font-medium">{label}</p>
                                <AdminField
                                    id={`${page}_title`}
                                    label="Page title"
                                    error={errors[`seo_pages.${page}.title`]}
                                    hint={<CharacterCount value={meta.title} limit={60 - site.company_name.length - 3} />}
                                >
                                    <Input id={`${page}_title`} value={meta.title} onChange={(e) => setPageMeta(page, 'title', e.target.value)} />
                                </AdminField>
                                <AdminField
                                    id={`${page}_description`}
                                    label="Meta description"
                                    error={errors[`seo_pages.${page}.description`]}
                                    hint={<CharacterCount value={meta.description} limit={160} />}
                                >
                                    <Textarea
                                        id={`${page}_description`}
                                        rows={2}
                                        value={meta.description}
                                        onChange={(e) => setPageMeta(page, 'description', e.target.value)}
                                    />
                                </AdminField>
                                <SearchPreview
                                    title={`${meta.title} - ${site.company_name}`}
                                    description={meta.description}
                                    url={page === 'home' ? origin : `${origin}/${page}`}
                                />
                            </div>
                        );
                    })}
                    <p className="text-muted-foreground text-xs">
                        Individual auction and lot pages use their own title, description and photo from CoreX automatically.
                    </p>
                </section>

                <section className="space-y-5">
                    <HeadingSmall title="Defaults" />
                    <AdminField
                        id="seo_description"
                        label="Default description"
                        error={errors.seo_description}
                        hint={<CharacterCount value={data.seo_description} limit={160} />}
                    >
                        <Textarea
                            id="seo_description"
                            rows={3}
                            value={data.seo_description}
                            onChange={(e) => setData('seo_description', e.target.value)}
                        />
                    </AdminField>
                    <AdminField
                        id="seo_keywords"
                        label="Keywords"
                        error={errors.seo_keywords}
                        hint="Comma separated. Google ignores these, but some other search engines still read them."
                    >
                        <Textarea id="seo_keywords" rows={2} value={data.seo_keywords} onChange={(e) => setData('seo_keywords', e.target.value)} />
                    </AdminField>
                </section>

                <section className="space-y-5">
                    <HeadingSmall
                        title="Social sharing image"
                        description="Shown when a link is shared on WhatsApp, Facebook, LinkedIn or X. Best size: 1200 × 630 px."
                    />
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <img
                            src={shownImage}
                            alt="Current sharing image"
                            className={`aspect-[1200/630] w-full max-w-xs rounded-lg border sm:w-64 ${hasCustomImage || imagePreview ? 'object-cover' : 'bg-muted object-contain p-4'}`}
                        />
                        <div className="grid gap-3">
                            <Input
                                id="seo_image"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(e) => chooseImage(e.target.files?.[0] ?? null)}
                            />
                            <InputError message={errors.seo_image} />
                            {hasCustomImage && !data.seo_image && (
                                <label className="flex items-center gap-2 text-sm">
                                    <Checkbox
                                        checked={data.remove_seo_image}
                                        onCheckedChange={(checked) => setData('remove_seo_image', checked === true)}
                                    />
                                    Remove the custom image and use the logo instead
                                </label>
                            )}
                        </div>
                    </div>
                </section>

                <section className="space-y-5">
                    <HeadingSmall title="Search Console & analytics" description="Paste only the code or ID, not the full snippet." />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <AdminField id="seo_google_verification" label="Google Search Console verification" error={errors.seo_google_verification}>
                            <Input
                                id="seo_google_verification"
                                value={data.seo_google_verification}
                                onChange={(e) => setData('seo_google_verification', e.target.value)}
                            />
                        </AdminField>
                        <AdminField id="seo_bing_verification" label="Bing Webmaster verification" error={errors.seo_bing_verification}>
                            <Input
                                id="seo_bing_verification"
                                value={data.seo_bing_verification}
                                onChange={(e) => setData('seo_bing_verification', e.target.value)}
                            />
                        </AdminField>
                        <AdminField id="seo_google_analytics_id" label="Google Analytics 4 ID" error={errors.seo_google_analytics_id}>
                            <Input
                                id="seo_google_analytics_id"
                                placeholder="G-XXXXXXXXXX"
                                value={data.seo_google_analytics_id}
                                onChange={(e) => setData('seo_google_analytics_id', e.target.value.toUpperCase())}
                            />
                        </AdminField>
                        <AdminField id="seo_google_tag_manager_id" label="Google Tag Manager ID" error={errors.seo_google_tag_manager_id}>
                            <Input
                                id="seo_google_tag_manager_id"
                                placeholder="GTM-XXXXXXX"
                                value={data.seo_google_tag_manager_id}
                                onChange={(e) => setData('seo_google_tag_manager_id', e.target.value.toUpperCase())}
                            />
                        </AdminField>
                        <AdminField id="seo_twitter_handle" label="X (Twitter) handle" error={errors.seo_twitter_handle}>
                            <Input
                                id="seo_twitter_handle"
                                placeholder="@capriviauctions"
                                value={data.seo_twitter_handle}
                                onChange={(e) => setData('seo_twitter_handle', e.target.value)}
                            />
                        </AdminField>
                    </div>
                </section>

                <div className="bg-background sticky bottom-0 flex items-center gap-4 border-t py-4">
                    <Button disabled={processing}>{processing ? 'Saving…' : 'Save SEO settings'}</Button>
                </div>
            </form>
        </AppLayout>
    );
}
