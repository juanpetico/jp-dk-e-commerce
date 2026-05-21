import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'JP DK Streetwear'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
    return new ImageResponse(
        <div
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000',
                fontFamily: 'sans-serif',
            }}
        >
            <div
                style={{
                    fontSize: 96,
                    fontWeight: 900,
                    color: '#fff',
                    letterSpacing: '-2px',
                    lineHeight: 1,
                }}
            >
                JP DK
            </div>
            <div
                style={{
                    fontSize: 32,
                    fontWeight: 300,
                    color: '#888',
                    letterSpacing: '8px',
                    marginTop: 16,
                }}
            >
                STREETWEAR
            </div>
        </div>,
        size,
    )
}
