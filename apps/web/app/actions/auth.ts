'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'

export async function signOut() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (token) {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: { Cookie: `token=${token}` },
            })
        } catch {
            // Non-critical — proceed with local cleanup regardless
        }
    }

    cookieStore.delete('token')
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function getServerSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return null

    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const padded = parts[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/')
            .padEnd(parts[1].length + (4 - (parts[1].length % 4)) % 4, '=')
        const payload = JSON.parse(atob(padded)) as { id: string; email: string; role: string; exp: number }
        if (payload.exp * 1000 < Date.now()) return null
        return payload
    } catch {
        return null
    }
}
