import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    // Only run on admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        const token = request.cookies.get('token')?.value

        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            // Decode JWT payload without external libraries (Edge compatible)
            // Token format: header.payload.signature
            const base64Url = token.split('.')[1]
            if (!base64Url) return NextResponse.redirect(new URL('/login', request.url))

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            }).join(''))

            const payload = JSON.parse(jsonPayload)

            if (payload.role !== 'ADMIN') {
                // If not admin, redirect to login (or 403 page if we had one, but login is requested)
                return NextResponse.redirect(new URL('/login', request.url))
            }
        } catch (e) {
            console.error('Middleware token parse error:', e)
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: '/admin/:path*',
}
