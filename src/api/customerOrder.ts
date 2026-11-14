import { apiFetch } from './fetchWrapper';
import { API_URL } from '../config';

export async function getSessionOrder(sessionToken: string): Promise<Response> {
    return apiFetch(`${API_URL}/dining-session/${sessionToken}/modal-order`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-RESTAURANT-ID' : localStorage.getItem('selectedRestaurantId') ?? ''
        },
    });
}