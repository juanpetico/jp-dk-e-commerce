import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Producto JP DK Streetwear'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

type Props = {
    params: Promise<{ slug: string }>
}

async function getProduct(slug: string) {
    try {
        const res = await fetch(`${API_URL}/products/slug/${slug}`, { next: { revalidate: 60 } })
        if (!res.ok) return null
        const json = await res.json()
        return json.data ?? null
    } catch {
        return null
    }
}

export default async function Image({ params }: Props) {
    const { slug } = await params
    const product = await getProduct(slug)

    const name: string = product?.name ?? 'JP DK Streetwear'
    const price: string = product?.price ? `$${(product.price as number).toLocaleString('es-CL')} CLP` : ''
    const imageUrl: string | null = product?.images?.[0]?.url ?? null
    const category: string = product?.category?.name ?? ''

    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                backgroundColor: '#000',
                fontFamily: 'sans-serif',
            }}
        >
            {imageUrl && (
                <div style={{ width: '50%', height: '100%', overflow: 'hidden', display: 'flex' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        alt={name}
                    />
                </div>
            )}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '60px',
                    gap: '12px',
                }}
            >
                {category && (
                    <div style={{ fontSize: 18, color: '#888', letterSpacing: '4px' }}>
                        {category.toUpperCase()}
                    </div>
                )}
                <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>
                    {name}
                </div>
                {price && (
                    <div style={{ fontSize: 28, fontWeight: 300, color: '#aaa', marginTop: '8px' }}>
                        {price}
                    </div>
                )}
                <div style={{ marginTop: 'auto', fontSize: 18, color: '#555', letterSpacing: '3px' }}>
                    JPDK.CL
                </div>
            </div>
        </div>,
        size,
    )
}
