import { Country } from "./global.ts";

export type RestaurantContextType = {
    selectedRestaurantId: number | null;
    setSelectedRestaurantId: (id: number) => void;
};

export type Restuarant = {
    id: number
    restaurant_name : string
    is_active : boolean
    address : string,
    email : string,
    contact_number : string
    country : Country
}
export type DiningSession = {
    id: number;
    restaurant_table_id: number;
    session_token: string;
    is_active: boolean;
    status: string;
    started_at: string;
    closed_at: string | null;
    restaurant_table: RestaurantTable;
};

export type RestaurantTable = {
    id: number;
    restaurant_id: number;
    table_name: string;
    capacity: number;
    is_active: boolean;
    qr_token: string;
    created_at: string;
    updated_at: string;
    dining_sessions: DiningSession[];
};