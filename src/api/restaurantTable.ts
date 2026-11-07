import { apiFetch } from './fetchWrapper';
import { API_URL } from '../config';
import { GetDiningSessionParams } from '../types/restaurant.ts';
import { GetQueryParams } from '../types/global.ts';


export async function getDiningSession(
    {
        page = 1,
        page_size = 8,
        sort_by = "started_at",
        sort_order = "desc",
        search,
        is_active,
        status,
        started_from,
        started_to
    }: GetDiningSessionParams = {},
): Promise<Response> {
    const params = new URLSearchParams({
        page: String(page),
        page_size: String(page_size),
    });

    if (sort_by) params.set('sort_by', sort_by);
    if (sort_order) params.set('sort_order', sort_order);
    if (search) params.set('search', search);
    if (is_active) params.set('is_active', String(is_active));
    if (status) params.set('status', status);
    if (started_from) params.set('started_from', started_from);
    if (started_to) params.set('started_to', started_to);

    return apiFetch(`${API_URL}/dining-session?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-RESTAURANT-ID': localStorage.getItem('selectedRestaurantId') ?? '',
        },
    });
}


export async function updateDiningSessionStatus(
    sessionToken: string,
    status: 'pending' | 'verified' | 'closed',
): Promise<Response> {
    return apiFetch(
        `${API_URL}/dining-session/${encodeURIComponent(sessionToken)}/status`,
        {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-Token': localStorage.getItem('csrf_token') ?? '',
                'X-RESTAURANT-ID': localStorage.getItem('selectedRestaurantId') ?? '',
            },
            body: JSON.stringify({ status }),
        },
    );
}

export async function getRestaurantTables(
    {
        page = 1,
        page_size = 25,
        sort_by = "created_at",
        sort_order = "desc",
        search,

    }: GetQueryParams = {},
): Promise<Response> {

    const params = new URLSearchParams({
        page: String(page),
        page_size: String(page_size),
    });

    if (sort_by) params.set('sort_by', sort_by);
    if (sort_order) params.set('sort_order', sort_order);
    if (search) params.set('search', search);

    return apiFetch(`${API_URL}/restaurant-table?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-RESTAURANT-ID': localStorage.getItem('selectedRestaurantId') ?? '',
        },
    });
}

