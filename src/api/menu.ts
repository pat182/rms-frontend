import { getCookie } from './utils'
import type { MenuItem } from '../types/menu';
import { apiFetch } from './fetchWrapper';
import { API_URL } from '../config';
import {type GetMenusQueryParams, type CompleteMenuPayload} from '../types/menu.ts'

export async function getMenus(
    {
        page = 1,
        page_size = 25,
        sort_by,
        sort_order,
        search,
    }: GetMenusQueryParams = {},
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
        },
    });
}

export async function getMenuById(menuId: number): Promise<Response> {
    return apiFetch(`${API_URL}/menus/${menuId}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
}

export async function addMenuApi(
    menuName: string,
    is_active: boolean,
): Promise<Response> {
    return apiFetch(`${API_URL}/menus`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            menu_name: menuName,
            is_active,
        }),
    });
}

export async function addMenuItemsApi(
    menuId: number,
    menuItems: MenuItem[],
): Promise<Response> {
    return apiFetch(`${API_URL}/menus/${menuId}/menu-items`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(
            menuItems.map(({ id, ...item }) => ({
                ...item,
                menu_id: menuId,
            })),
        ),
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
            'X-CSRF-Token': getCookie('csrf_token') ?? '',
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
            },
            body: JSON.stringify({
                image_url: imageUrl,
            }),
        }
    );
}
