import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';

/**
 * Mirrors the meta tags that app.blade.php renders server-side, so they stay
 * correct after client-side navigation. The page title suffix is added by the
 * title callback in app.tsx.
 */
export default function Seo() {
    const { seo, site } = usePage<SharedData>().props;

    if (!seo) {
        return null;
    }

    const title = seo.title || site.company_name;

    return (
        <Head>
            <title>{seo.title}</title>
            <meta head-key="description" name="description" content={seo.description} />
            <link head-key="canonical" rel="canonical" href={seo.url} />
            <meta head-key="og:type" property="og:type" content={seo.type} />
            <meta head-key="og:site_name" property="og:site_name" content={site.company_name} />
            <meta head-key="og:title" property="og:title" content={title} />
            <meta head-key="og:description" property="og:description" content={seo.description} />
            <meta head-key="og:url" property="og:url" content={seo.url} />
            <meta head-key="og:image" property="og:image" content={seo.image} />
            <meta head-key="og:locale" property="og:locale" content="en_ZA" />
            <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta head-key="twitter:title" name="twitter:title" content={title} />
            <meta head-key="twitter:description" name="twitter:description" content={seo.description} />
            <meta head-key="twitter:image" name="twitter:image" content={seo.image} />
        </Head>
    );
}
