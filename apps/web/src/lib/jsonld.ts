import type { Product } from '@/types'

interface BreadcrumbItem {
    name: string
    item: string
}

export function generateProductJsonLd(product: Product, siteUrl: string): string {
    const image = product.images?.[0]?.url

    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description || product.name,
        image: image ? [image] : [],
        url: `${siteUrl}/product/${product.slug}`,
        sku: product.id,
        brand: {
            '@type': 'Brand',
            name: 'JP DK',
        },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'CLP',
            availability: product.variants?.some((v) => v.stock > 0)
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'JP DK Streetwear',
            },
        },
    })
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): string {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.item,
        })),
    })
}

export function generateOrganizationJsonLd(siteUrl: string): string {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'JP DK Streetwear',
        url: siteUrl,
        logo: `${siteUrl}/icon.png`,
    })
}

export function generateWebSiteJsonLd(siteUrl: string): string {
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'JP DK Streetwear',
        url: siteUrl,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${siteUrl}/catalog?search={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    })
}
