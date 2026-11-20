import { Country, GetQueryParams } from "./global.ts";

export type RestaurantContextType = {
    selectedRestaurantId: number | null;
    setSelectedRestaurantId: (id: number) => void;
};
export type RestaurantOperatingHours = {
    id: number
    configuration_id: number
    day_of_week: number
    opening_time: string | null
    closing_time: string | null
    is_closed: boolean
}

export type RestaurantConfiguration = {
    id: number
    restaurant_id: number
    is_24_hours: boolean
    created_at: string
    updated_at: string
    operating_hours: RestaurantOperatingHours[]
}

export type Restuarant = {
    id: number
    country_id: number | null
    restaurant_name : string
    is_active : boolean
    address : string,
    email : string,
    contact_number : string
    country : Country
    configuration: RestaurantConfiguration | null
}

export type RestaurantFormData = Omit<Restuarant, "id" | "country"> & {
    country_id: number | null;
    country: Restuarant["country"] | null;
};

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
    table_id: number;
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

export interface GetRetaurantTableParams extends GetQueryParams {
    dashboard?: boolean
}

export type RestaurantTableActionProps = {
    table: RestaurantTable;
    onViewQr: (table: RestaurantTable) => void;
    // onView: (table: RestaurantTable) => void;
    onEdit: (table: RestaurantTable) => void;
    onDelete: (table: RestaurantTable) => void;
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

export type DiningSessionCardProps = {
    sessions: DiningSession[];
    updatingSessionId: number | null;
    onUpdateStatus: (
        session: DiningSession,
        status: "verified" | "closed"
    ) => void;
};