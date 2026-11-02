
import { getCookie } from './utils'
import { API_URL } from '../config'

let refreshRequest: Promise<Response> | null = null

export async function login(email:string, password:string) {
    return fetch(`${API_URL}/auth`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
}

export async function getCurrentUser(shouldRefresh = true) {
    let response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
        },
    })

    if (shouldRefresh && response.status === 401) {
        const refreshResponse = await refreshToken()

        if (!refreshResponse.ok) {
            return response
        }

        response = await fetch(`${API_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
            },
        })
    }

    return response
}

export async function refreshToken() {
    if (!refreshRequest) {
        refreshRequest = fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-Token': localStorage.getItem('csrf_token') ?? ''
            },
        }).then(async response => {
            if (response.ok) {
                const payload: unknown = await response.clone().json()
                if (
                    typeof payload === 'object' &&
                    payload !== null &&
                    'csrf' in payload &&
                    typeof payload.csrf === 'string'
                ) {
                    localStorage.setItem('csrf_token', payload.csrf)
                }
            }

            return response
        }).finally(() => {
            refreshRequest = null
        })
    }

    return (await refreshRequest).clone()
}

export async function logout() {
    return fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            // 'X-CSRF-Token':  localStorage.getItem('csrf_token') ?? ''
        },
    })
}
