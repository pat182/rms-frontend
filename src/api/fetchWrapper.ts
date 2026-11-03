import { logout, refreshToken } from './auth';

async function logoutAndRedirect(): Promise<void> {
    try {
        await logout();
    } finally {
        localStorage.removeItem('user');
        localStorage.removeItem('selectedRestaurantId');
        localStorage.removeItem('csrf_token');
        window.location.replace('/login');
    }
}

export async function apiFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
    });

    if (response.status !== 401) {
        return response;
    }

    if (url.includes('/auth/refresh')) {
        return response;
    }

    let refreshResponse: Response;
    
    try {
        refreshResponse = await refreshToken();
    } catch (error) {
        await logoutAndRedirect();
        throw error;
    }

    if (!refreshResponse.ok) {
        await logoutAndRedirect();
        return response;
    }

    const refreshData = await refreshResponse.json();
    const csrfToken = refreshData.csrf;
    const headers = new Headers(options.headers);

    if (csrfToken) {
        localStorage.setItem('csrf_token', csrfToken);
        headers.set('X-CSRF-Token', csrfToken);
    }

    const retryResponse = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (retryResponse.status === 401) {
        await logoutAndRedirect();
    }

    return retryResponse;
}