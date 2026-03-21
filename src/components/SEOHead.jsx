/**
 * SEOHead — React 19 native metadata component.
 *
 * React 19 hoists <title>, <meta>, and <link> elements rendered anywhere in the
 * component tree into <head> automatically. This is far more reliable than the
 * previous useEffect/DOM-manipulation approach because:
 *
 *  - Tags are present on the FIRST render (no flash / race condition)
 *  - React deduplicates by the `name` / `property` attribute
 *  - Works correctly with React's reconciler on navigation
 *  - Social crawlers that do execute JS see the correct tags immediately
 */

const DEFAULT_IMAGE = 'https://bookreccs.netlify.app/book-reccs-cover.png';

export default function SEOHead({
    title,
    description,
    keywords,
    url,
    image,
    type = 'website',
    structuredData,   // optional JSON-LD object, rendered as page-specific schema
}) {
    const ogImage = image || DEFAULT_IMAGE;

    return (
        <>
            {/* Primary */}
            {title && <title>{title}</title>}
            {description && <meta name="description" content={description} />}
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph */}
            <meta property="og:type" content={type} />
            {title && <meta property="og:title" content={title} />}
            {description && <meta property="og:description" content={description} />}
            {url && <meta property="og:url" content={url} />}
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content="Book Reccs" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            {title && <meta name="twitter:title" content={title} />}
            {description && <meta name="twitter:description" content={description} />}
            {url && <meta name="twitter:url" content={url} />}
            <meta name="twitter:image" content={ogImage} />

            {/* Canonical */}
            {url && <link rel="canonical" href={url} />}

            {/* Page-specific structured data */}
            {structuredData && (
                <script type="application/ld+json">
                    {JSON.stringify(structuredData)}
                </script>
            )}
        </>
    );
}
