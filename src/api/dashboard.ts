import { apiFetch } from './fetchWrapper';
import { API_URL } from '../config';
import { OrderChartParams, OrderDashboardParams } from '../types/dashboard.ts';

export async function getRecentOrders(
    {
        page = 1,
        page_size = 5,
        sort_by = "created_at",
        sort_order = "desc",
        search,
        order_from,
        order_at,
    }: OrderDashboardParams = {},
): Promise<Response> {

    const params = new URLSearchParams({
        page: String(page),
        page_size: String(page_size),
    });

    if (sort_by) params.set('sort_by', sort_by);
    if (sort_order) params.set('sort_order', sort_order);
    if (search) params.set('search', search);
    if (order_from) params.set('order_from', order_from);
    if (order_at) params.set('order_at', order_at);

    return apiFetch(
        `${API_URL}/dashboard/recent-orders?${params.toString()}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-type': 'application/json',
                'X-RESTAURANT-ID': localStorage.getItem('selectedRestaurantId') ?? '',
            },
        }
    );
}

export async function getChartOrders(
    {
        order_from,
        order_at,
    }: OrderChartParams = {},
): Promise<Response> {

    const params = new URLSearchParams();

    if (order_from) params.set("order_from", order_from);
    if (order_at) params.set("order_at", order_at);

    return apiFetch(
        `${API_URL}/dashboard/order-chart?${params.toString()}`,
        {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-RESTAURANT-ID": localStorage.getItem("selectedRestaurantId") ?? "",
            },
        }
    );
}