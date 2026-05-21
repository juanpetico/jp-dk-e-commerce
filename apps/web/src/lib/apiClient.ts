const TOKEN_KEY = 'auth_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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

function buildRequest(url: string, options: RequestInit): RequestInit {
    const token = tokenStore.get();
    const headers = new Headers(options.headers as HeadersInit);
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return { credentials: 'include' as RequestCredentials, ...options, headers };
}

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

async function attemptRefresh(): Promise<boolean> {
    try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!res.ok) return false;
        const data = await res.json();
        if (data.data?.token) tokenStore.set(data.data.token);
        return true;
    } catch {
        return false;
    }
}

function drainQueue(): void {
    const queue = [...pendingQueue];
    pendingQueue = [];
    queue.forEach((fn) => fn());
}

export async function apiFetch(url: string, options: RequestInit = {}, skipAuthRefresh = false): Promise<Response> {
    const response = await fetch(url, buildRequest(url, options));

    if (response.status !== 401 || skipAuthRefresh) return response;

    // Queue concurrent 401s while a refresh is in flight
    if (isRefreshing) {
        return new Promise<Response>((resolve, reject) => {
            pendingQueue.push(() =>
                fetch(url, buildRequest(url, options)).then(resolve).catch(reject)
            );
        });
    }

    isRefreshing = true;
    const refreshed = await attemptRefresh();
    isRefreshing = false;

    if (refreshed) {
        drainQueue();
        return fetch(url, buildRequest(url, options));
    }

    // Refresh failed — notify app to clear session
    drainQueue();
    tokenStore.clear();
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
    }
    return response;
}
