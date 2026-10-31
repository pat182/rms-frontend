
import { getCookie } from './utils'
import { API_URL } from '../config'

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
    console.log(  `LOCAL: ${localStorage.getItem('csrf_token')}`)
    return fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token':  localStorage.getItem('csrf_token') ?? ''
        },
    })
}
