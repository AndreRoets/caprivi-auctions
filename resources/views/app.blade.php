@php
    $settings = app(\App\Support\SiteSettings::class);
    $site = $settings->all();
    $seo = $page['props']['seo'] ?? null;
    $siteName = $site['company_name'];
    $indexable = $seo && $site['seo_allow_indexing'];
    $schema = [
        '@context' => 'https://schema.org',
        '@type' => 'RealEstateAgent',
        'name' => $siteName,
        'legalName' => $site['legal_name'],
        'url' => url('/'),
        'logo' => asset('images/caprivi-logo.png'),
        'image' => $settings->seoImageUrl(),
        'description' => $site['seo_description'],
        'telephone' => $site['main_phone'],
        'email' => $site['emails'][0] ?? null,
        'address' => ['@type' => 'PostalAddress', 'streetAddress' => $site['address'], 'addressCountry' => 'ZA'],
        'sameAs' => array_values(array_filter([$site['facebook_url'], $site['instagram_url'], $site['linkedin_url'], $site['youtube_url'], $site['parent_site_url']])),
    ];
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ $seo && $seo['title'] ? $seo['title'].' - '.$siteName : $siteName }}</title>
        <meta name="robots" content="{{ $indexable ? 'index, follow' : 'noindex, nofollow' }}">
        <meta name="theme-color" content="#0e2235">

        @if ($seo)
            <meta inertia="description" name="description" content="{{ $seo['description'] }}">
            <link inertia="canonical" rel="canonical" href="{{ $seo['url'] }}">
            <meta inertia="og:type" property="og:type" content="{{ $seo['type'] }}">
            <meta inertia="og:site_name" property="og:site_name" content="{{ $siteName }}">
            <meta inertia="og:title" property="og:title" content="{{ $seo['title'] ?: $siteName }}">
            <meta inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
            <meta inertia="og:url" property="og:url" content="{{ $seo['url'] }}">
            <meta inertia="og:image" property="og:image" content="{{ $seo['image'] }}">
            <meta inertia="og:locale" property="og:locale" content="en_ZA">
            <meta inertia="twitter:card" name="twitter:card" content="summary_large_image">
            <meta inertia="twitter:title" name="twitter:title" content="{{ $seo['title'] ?: $siteName }}">
            <meta inertia="twitter:description" name="twitter:description" content="{{ $seo['description'] }}">
            <meta inertia="twitter:image" name="twitter:image" content="{{ $seo['image'] }}">
            @if ($site['seo_keywords'])
                <meta name="keywords" content="{{ $site['seo_keywords'] }}">
            @endif
            @if ($site['seo_twitter_handle'])
                <meta name="twitter:site" content="{{ '@'.ltrim($site['seo_twitter_handle'], '@') }}">
            @endif
            <script type="application/ld+json">{!! json_encode($schema, JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) !!}</script>
        @endif

        @if ($site['seo_google_verification'])
            <meta name="google-site-verification" content="{{ $site['seo_google_verification'] }}">
        @endif
        @if ($site['seo_bing_verification'])
            <meta name="msvalidate.01" content="{{ $site['seo_bing_verification'] }}">
        @endif

        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/images/caprivi-logo.png">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|fraunces:500,600,500i" rel="stylesheet" />

        @if ($seo && $site['seo_google_tag_manager_id'])
            <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',@json($site['seo_google_tag_manager_id']));</script>
        @endif
        @if ($seo && $site['seo_google_analytics_id'])
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ $site['seo_google_analytics_id'] }}"></script>
            <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',@json($site['seo_google_analytics_id']));</script>
        @endif

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @if ($seo && $site['seo_google_tag_manager_id'])
            <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $site['seo_google_tag_manager_id'] }}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
        @endif
        @inertia
    </body>
</html>
