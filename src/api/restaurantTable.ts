import { apiFetch } from './fetchWrapper';
import { API_URL } from '../config';
import { type GetQueryParams } from '../types/global.ts';


export async function getDiningSession(
    {
        page = 1,
        page_size = 25,
        sort_by = "started_at",
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

    return apiFetch(`${API_URL}/dining-session?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-RESTAURANT-ID': localStorage.getItem('selectedRestaurantId') ?? '',
        },
    });
}


export async function updateRestaurantTableStatus(
    sessionToken: string,
    status: 'pending' | 'verified' | 'rejected',
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