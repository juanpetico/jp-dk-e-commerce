export function resolvePostLoginRedirect(redirectUrl: string | null, role?: string): string {
    if (redirectUrl) return redirectUrl;
    if (role === 'SUPERADMIN') return '/superadmin/dashboard';
    if (role === 'ADMIN') return '/admin/dashboard';
    return '/profile';
}
