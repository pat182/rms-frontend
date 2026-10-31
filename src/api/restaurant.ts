import { apiFetch } from './fetchWrapper';
import { API_URL } from '../config';
import { type GetQueryParams } from '../types/global.ts';

export async function getRestaurants(
    {
        page = 1,
        page_size = 25,
        sort_by,
        sort_order,
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

    return apiFetch(`${API_URL}/restaurants?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
        },
    });
}