import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductPageClient from '@/components/store/product-detail/ProductPageClient'
import { Product } from '@/types'
import { generateProductJsonLd, generateBreadcrumbJsonLd } from '@/lib/jsonld'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jpdk.cl'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

async function getProduct(slug: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/products/slug/${slug}`, { next: { revalidate: 60 } })
        if (!res.ok) return null
        const json = await res.json()
        return json.data ?? null
    } catch {
        return null
    }
}

export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_URL}/products?isPublished=true`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return (json.data as { slug: string }[]).map((p) => ({ slug: p.slug }))
    } catch {
        return []
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const product = await getProduct(slug)
    if (!product) return { title: 'Producto no encontrado' }

    const image = product.images?.[0]?.url
    const siteName = 'JP DK Streetwear'
    const url = `${SITE_URL}/product/${slug}`
    const description = product.description || `${product.name} — Streetwear urbano de calidad.`

    return {
        title: product.name,
        description,
        alternates: { canonical: url },
        openGraph: {
            title: product.name,
            description,
            url,
            siteName,
            images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.name,
            description,
            images: image ? [image] : [],
        },
        other: {
            'product:price:amount': String(product.price),
            'product:price:currency': 'CLP',
        },
    }
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product || product.category?.isPublished === false) return notFound()

    const breadcrumbs = [
        { name: 'Inicio', item: SITE_URL },
        { name: product.category?.name ?? 'Categoría', item: `${SITE_URL}/catalog?category=${product.category?.slug}` },
        { name: product.name, item: `${SITE_URL}/product/${slug}` },
    ]

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: generateProductJsonLd(product, SITE_URL) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: generateBreadcrumbJsonLd(breadcrumbs) }}
            />
            <ProductPageClient initialProduct={product} />
        </>
    )
}
