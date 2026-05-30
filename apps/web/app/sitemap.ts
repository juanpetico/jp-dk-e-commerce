import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jpdk.cl'

async function getProductSlugs(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/products?isPublished=true`, { next: { revalidate: 3600 } })
        if (!res.ok) return []
        const json = await res.json()
        return (json.data as { slug: string }[]).map((p) => p.slug)
    } catch {
        return []
    }
}

async function getCategorySlugs(): Promise<string[]> {
    try {
        const res = await fetch(`${API_URL}/categories?isPublished=true`, { next: { revalidate: 3600 } })
        if (!res.ok) return []
        const json = await res.json()
        return (json.data as { slug: string }[]).map((c) => c.slug)
    } catch {
        return []
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [productSlugs, categorySlugs] = await Promise.all([getProductSlugs(), getCategorySlugs()])

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${SITE_URL}/catalog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ]

    const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
        url: `${SITE_URL}/product/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }))

    const categoryRoutes: MetadataRoute.Sitemap = categorySlugs.map((slug) => ({
        url: `${SITE_URL}/catalog?category=${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }))

    return [...staticRoutes, ...productRoutes, ...categoryRoutes]
}
