import { refreshToken } from './auth';

import { getCookie } from './utils'


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

    const refreshResponse = await refreshToken();

    if (!refreshResponse.ok) {
        return response;
    }

    // Get the newly generated CSRF token.
    const csrfToken =  await refreshResponse.clone().json();

    const headers = new Headers(options.headers);

    if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
    }
    
    // Retry with updated CSRF token.
    return fetch(url, {
        ...options,
        headers,
        credentials: 'include',
    });
}