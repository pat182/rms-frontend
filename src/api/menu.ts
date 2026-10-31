import { getCookie } from './utils'
import type { MenuItem } from '../types/menu';
import { apiFetch } from './fetchWrapper';
import { API_URL } from '../config';
import {type CompleteMenuPayload} from '../types/menu.ts'
import {type GetQueryParams,} from '../types/global.ts'

export async function getMenus(
    {
        page = 1,
        page_size = 25,
        sort_by,
        sort_order,
        search,
    }: GetQueryParams = {},
) {
    const params = new URLSearchParams({
        page: String(page),
        page_size: String(page_size),
    });

    if (sort_by) params.set('sort_by', sort_by);
    if (sort_order) params.set('sort_order', sort_order);
    if (search) params.set('search', search);

    return apiFetch(`${API_URL}/menus?${params.toString()}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-type': 'application/json',
            'X-RESTAURANT-ID' : localStorage.getItem('selectedRestaurantId') ?? ''
        },
    });
}

export async function getMenuById(menuId: number): Promise<Response> {
    return apiFetch(`${API_URL}/menus/${menuId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-RESTAURANT-ID' : localStorage.getItem('selectedRestaurantId') ?? ''
        },
    });
}

export async function createCompleteMenuApi(
    payload: CompleteMenuPayload,
): Promise<Response> {
    return apiFetch(`${API_URL}/menus/complete`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token': localStorage.getItem('csrf_token') ?? '',
            'X-RESTAURANT-ID' : localStorage.getItem('selectedRestaurantId') ?? ''
        },
        body: JSON.stringify(payload),
    });
}

export async function updateCompleteMenuApi(
    menuId: number,
    payload: object,
): Promise<Response> {
    return apiFetch(`${API_URL}/menus/${menuId}/update/complete`, {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token': localStorage.getItem('csrf_token') ?? '',
            'X-RESTAURANT-ID' : localStorage.getItem('selectedRestaurantId') ?? ''
        },
        body: JSON.stringify(payload),
    });
}

export async function uploadMenuItemImageApi(
    menuId: number,
    menuItemId: number,
    file: File,
): Promise<Response> {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch(
        `${API_URL}/menus/${menuId}/menu-items/${menuItemId}/menu-item-image`,
        {
            method: "POST",
            headers: {
                'Accept': "application/json",
                'X-CSRF-Token': localStorage.getItem('csrf_token') ?? '',
                'X-RESTAURANT-ID' : localStorage.getItem('selectedRestaurantId') ?? ''
            },
            body: formData,
        },
    );
}

export async function updateMenuStatusApi(
    menuId: number,
    isActive: boolean,
): Promise<Response> {
    return apiFetch(`${API_URL}/menus/${menuId}/status`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-Token': localStorage.getItem('csrf_token') ?? '',
            'X-RESTAURANT-ID' : localStorage.getItem('selectedRestaurantId') ?? ''
        },
        body: JSON.stringify({ is_active: isActive }),
    });
}

export async function deleteItemImageApi(
    menuId: number,
    menuItemId: number,
    imageUrl: string,
): Promise<Response> {
    return apiFetch(
        `${API_URL}/menus/${menuId}/menu-items/${menuItemId}/menu-item-image`,
        {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                'X-CSRF-Token': localStorage.getItem('csrf_token') ?? '',
                'X-RESTAURANT-ID' : localStorage.getItem('selectedRestaurantId') ?? ''
            },
            body: JSON.stringify({
                image_url: imageUrl,
            }),
        }
    );
}
