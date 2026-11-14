import type { DiningSession } from "./restaurant.ts";

export type OrdersModalProps = {
    session: DiningSession;
    onClose: () => void;
};

export type OrderItem = {
    id: number | string;
    order_id: number | string;
    menu_item_id: number | string;
    item_name: string;
    quantity: number;
    unit_price: number | string;
    subtotal: number | string;
    special_request?: string | null;
};

export type OrderData = {
    id?: number | string;
    order_id?: number | string;
    session_token?: string;
    status: string;
    created_at?: string;
    total_amount?: number | string;
    subtotal?: number | string;
    amount?: number | string;
    items: OrderItem[];
};