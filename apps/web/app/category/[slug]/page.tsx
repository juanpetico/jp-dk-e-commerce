import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryPageClient from '@/components/store/category/CategoryPageClient'
import { Category, Product } from '@/types'
import { generateBreadcrumbJsonLd } from '@/lib/jsonld'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jpdk.cl'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

async function getCategory(slug: string): Promise<Category | null> {
    try {
        const res = await fetch(`${API_URL}/categories/slug/${slug}?isPublished=true`, { next: { revalidate: 60 } })
        if (!res.ok) return null
        const json = await res.json()
        return json.data ?? null
    } catch {
        return null
    }
}

async function getCategoryProducts(categoryId: string): Promise<Product[]> {
    try {
        const res = await fetch(`${API_URL}/products?categoryId=${categoryId}&isPublished=true`, {
            next: { revalidate: 60 },
        })
        if (!res.ok) return []
        const json = await res.json()
        return json.data ?? []
    } catch {
        return []
    }
}

export async function generateStaticParams() {
    try {
        const res = await fetch(`${API_URL}/categories?isPublished=true`, { next: { revalidate: 60 } })
        if (!res.ok) return []
        const json = await res.json()
        return (json.data as { slug: string }[]).map((c) => ({ slug: c.slug }))
    } catch {
        return []
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const category = await getCategory(slug)
    if (!category) return { title: 'Categoría no encontrada' }

    const siteName = 'JP DK Streetwear'
    const url = `${SITE_URL}/category/${slug}`
    const description = category.description || `${category.name} — Colección de streetwear JP DK.`

    return {
        title: category.name,
        description,
        alternates: { canonical: url },
        openGraph: {
            title: `${category.name} | ${siteName}`,
            description,
            url,
            siteName,
            images: category.imageUrl ? [{ url: category.imageUrl, width: 800, height: 800, alt: category.name }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${category.name} | ${siteName}`,
            description,
            images: category.imageUrl ? [category.imageUrl] : [],
        },
    }
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params
    const category = await getCategory(slug)

    if (!category) return notFound()

    const products = await getCategoryProducts(category.id)

    const breadcrumbs = [
        { name: 'Inicio', item: SITE_URL },
        { name: category.name, item: `${SITE_URL}/category/${slug}` },
    ]

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: generateBreadcrumbJsonLd(breadcrumbs) }}
            />
            <CategoryPageClient initialCategory={category} initialProducts={products} />
        </>
    )
}
