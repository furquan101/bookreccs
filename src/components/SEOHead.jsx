import { useEffect } from 'react';

/**
 * SEO Head Component
 * Dynamically updates meta tags for SEO
 * Why this is good for SEO:
 * - Unique URLs for each reading taste profile
 * - Long-tail keyword targeting (e.g., "books for productivity growth thinking")
 * - Shareable pages with unique meta tags
 * - Better indexing and organic traffic opportunities
 */
export default function SEOHead({ 
    title, 
    description, 
    keywords, 
    url, 
    image,
    type = "website"
}) {
    useEffect(() => {
        // Update document title
        if (title) {
            document.title = title;
        }

        // Update or create meta tags
        const updateMetaTag = (property, content) => {
            if (!content) return;
            
            let element = document.querySelector(`meta[property="${property}"]`) || 
                         document.querySelector(`meta[name="${property}"]`);
            
            if (!element) {
                element = document.createElement('meta');
                if (property.startsWith('og:') || property.startsWith('twitter:')) {
                    element.setAttribute('property', property);
                } else {
                    element.setAttribute('name', property);
                }
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        // Primary meta tags
        updateMetaTag('title', title);
        updateMetaTag('description', description);
        if (keywords) {
            updateMetaTag('keywords', keywords);
        }

        // Open Graph / Facebook
        updateMetaTag('og:type', type);
        updateMetaTag('og:title', title);
        updateMetaTag('og:description', description);
        updateMetaTag('og:url', url);
        if (image) {
            updateMetaTag('og:image', image);
        }
        updateMetaTag('og:site_name', 'Book Reccs');

        // Twitter
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', title);
        updateMetaTag('twitter:description', description);
        updateMetaTag('twitter:url', url);
        if (image) {
            updateMetaTag('twitter:image', image);
        }

        // Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        if (url) {
            canonical.setAttribute('href', url);
        }

        // Structured Data (JSON-LD)
        let structuredData = document.querySelector('script[type="application/ld+json"][data-reading-taste]');
        if (!structuredData) {
            structuredData = document.createElement('script');
            structuredData.setAttribute('type', 'application/ld+json');
            structuredData.setAttribute('data-reading-taste', 'true');
            document.head.appendChild(structuredData);
        }

        if (title && description) {
            const schema = {
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                "name": title,
                "description": description,
                "url": url || window.location.href,
                "mainEntity": {
                    "@type": "ItemList",
                    "name": title,
                    "description": description
                }
            };
            structuredData.textContent = JSON.stringify(schema);
        }

        // Cleanup function
        return () => {
            // Optionally reset to default on unmount
        };
    }, [title, description, keywords, url, image, type]);

    return null; // This component doesn't render anything
}
