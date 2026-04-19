const TOKEN_KEY = 'auth_token';

export const tokenStore = {
    get: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },
    set: (token: string): void => {
        localStorage.setItem(TOKEN_KEY, token);
    },
    clear: (): void => {
        localStorage.removeItem(TOKEN_KEY);
    },
};

export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = tokenStore.get();
    const headers = new Headers(options.headers as HeadersInit);
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return fetch(url, {
        credentials: 'include',
        ...options,
        headers,
    });
}
