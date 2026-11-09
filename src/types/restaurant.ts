import { Country, GetQueryParams } from "./global.ts";

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
    restaurant_table_id?: number;
    session_token: string;
    is_active: boolean;
    status: 'pending' | 'verified' | 'closed';
    started_at: string;
    created_at?: string;
    closed_at: string | null;
    restaurant_table: Pick<RestaurantTable, "table_name">;
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

export interface GetDiningSessionParams extends GetQueryParams {
    is_active?: boolean;
    status?: 'pending' | 'verified' | 'closed';
    started_from?: string;
    started_to?: string;
}


export type RestaurantTableActionProps = {
    table: RestaurantTable;
    onViewQr: (table: RestaurantTable) => void;
    // onView: (table: RestaurantTable) => void;
    onEdit: (table: RestaurantTable) => void;
    onDelete: (table: RestaurantTable) => void;
};

export type RestaurantFormData = Omit<Restuarant, "id" | "country"> & {
    country: Restuarant["country"] | null;
};

export type TableDraft = {
    id: number;
    table_name: string;
    capacity: string;
    is_active: boolean;
};

export type CreateRestaurantTablePayload = {
    table_name: string;
    capacity: number;
    is_active: boolean;
};