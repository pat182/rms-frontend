import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";

import {type RestaurantContextType} from "../../types/restaurant.ts"

const RestaurantContext = createContext<RestaurantContextType | undefined>(
    undefined
);

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const restaurants = Array.isArray(user?.restaurants)
        ? user.restaurants
        : [];

    
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [selectedRestaurantId, setSelectedRestaurantIdState] = useState<number | null>(() => {
        const savedId = Number(localStorage.getItem("selectedRestaurantId"));

        return restaurants.some(
            (restaurant: { id: number }) => restaurant.id === savedId
        )
            ? savedId
        : restaurants[0]?.id ?? null;
    });

    const setSelectedRestaurantId = (id: number) => {
        setSelectedRestaurantIdState(id);
        localStorage.setItem("selectedRestaurantId", String(id));
    };

    return (
        <RestaurantContext.Provider
            value={{
                selectedRestaurantId,
                setSelectedRestaurantId,
                setDropdownOpen,
                dropdownOpen,
                notificationsOpen,
                setNotificationsOpen

            }}
        >
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurant() {
    const context = useContext(RestaurantContext);

    if (!context) {
        throw new Error(
            "useRestaurant must be used inside RestaurantProvider"
        );
    }

    return context;
}