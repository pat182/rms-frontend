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