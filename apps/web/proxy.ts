import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

interface JWTPayload {
    id: string
    email: string
    role: string
    exp: number
}

function decodeJWT(token: string): JWTPayload | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/').padEnd(
            parts[1].length + (4 - (parts[1].length % 4)) % 4, '='
        )
        return JSON.parse(atob(padded)) as JWTPayload
    } catch {
        return null
    }
}

const ROUTE_RULES: { pattern: RegExp; roles: string[] }[] = [
    { pattern: /^\/superadmin/, roles: ['SUPERADMIN'] },
    { pattern: /^\/admin/, roles: ['ADMIN', 'SUPERADMIN'] },
    { pattern: /^\/(orders|profile|settings|coupons|checkout)/, roles: ['CLIENT', 'ADMIN', 'SUPERADMIN'] },
]

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    const rule = ROUTE_RULES.find(r => r.pattern.test(pathname))
    if (!rule) return NextResponse.next()

    const token = request.cookies.get('token')?.value

    if (!token) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    const payload = decodeJWT(token)

    if (!payload || payload.exp * 1000 < Date.now()) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        const response = NextResponse.redirect(loginUrl)
        response.cookies.delete('token')
        return response
    }

    if (!rule.roles.includes(payload.role)) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/superadmin/:path*',
        '/orders/:path*',
        '/profile/:path*',
        '/settings',
        '/coupons',
        '/checkout/:path*',
    ],
}
