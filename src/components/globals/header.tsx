import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu } from "lucide-react";
import { type SideBarProps } from "../../types/global";
import { useRestaurant } from "./restaurantContext";
import { useNavigate } from "react-router-dom";

export default function TopBar({
    sidebarOpen,
    setSidebarOpen,
}: SideBarProps) {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const restaurants = Array.isArray(user?.restaurants) ? user.restaurants : [];

    const {
        selectedRestaurantId,
        setSelectedRestaurantId,
    } = useRestaurant();

    
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const restaurantName =
        restaurants.find(
            (restaurant: { id: number }) => restaurant.id === selectedRestaurantId,
        )?.restaurant_name ?? "Restaurant";
 
    console.log(`TEST:${restaurantName}`)

    useEffect(() => {
        if (!dropdownOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (!dropdownRef.current?.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, [dropdownOpen]);

    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
            <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="cursor-pointer rounded-lg bg-[#6495ED] p-2 text-white transition hover:bg-blue-500 md:hidden"
                aria-label="Toggle sidebar"
            >
                <Menu size={22} />
            </button>

            {restaurants.length > 1 ? (
                <div
                    ref={dropdownRef}
                    className="relative ml-auto"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            setDropdownOpen(false);
                            triggerRef.current?.focus();
                        } else if (event.key === "ArrowDown" && !dropdownOpen) {
                            event.preventDefault();
                            setDropdownOpen(true);
                            requestAnimationFrame(() => {
                                dropdownRef.current
                                    ?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')
                                    ?.focus();
                            });
                        } else if (
                            dropdownOpen &&
                            (event.key === "ArrowDown" || event.key === "ArrowUp")
                        ) {
                            const options = dropdownRef.current?.querySelectorAll<HTMLButtonElement>(
                                '[role="menuitemradio"]',
                            );
                            if (!options?.length) return;

                            event.preventDefault();
                            const currentIndex = Array.from(options).indexOf(
                                document.activeElement as HTMLButtonElement,
                            );
                            const direction = event.key === "ArrowDown" ? 1 : -1;
                            const nextIndex =
                                (currentIndex + direction + options.length) % options.length;
                            options[nextIndex].focus();
                        }
                    }}
                >
                    <button
                        ref={triggerRef}
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={dropdownOpen}
                        aria-label={`Select restaurant, currently ${restaurantName}`}
                        onClick={() => setDropdownOpen((open) => !open)}
                        className="flex max-w-[70vw] cursor-pointer items-center gap-2 bg-white px-3 py-2 text-lg font-semibold text-slate-800 transition md:max-w-md"
                    >
                        <span className="truncate">{restaurantName}</span>
                        <ChevronDown
                            aria-hidden="true"
                            size={16}
                            className={`shrink-0 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>
                    {dropdownOpen && (
                        <div
                            role="menu"
                            aria-label="Restaurants"
                            className="absolute right-0 z-50 mt-2 max-h-64 min-w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                        >
                            {restaurants.map(
                                (restaurant: {
                                    id: number;
                                    restaurant_name: string;
                                }) => (
                                    <button
                                        key={restaurant.id}
                                        type="button"
                                        role="menuitemradio"
                                        aria-checked={restaurant.id === selectedRestaurantId}
                                        tabIndex={0}
                                        onClick={() => {
                                            const restaurantChanged =
                                                restaurant.id !== selectedRestaurantId;

                                            setSelectedRestaurantId(restaurant.id);
                                            setDropdownOpen(false);

                                            if (
                                                restaurantChanged &&
                                                location.pathname.startsWith("/menu/edit/")
                                            ) {
                                                navigate("/menu");
                                            }
                                        }}
                                        className={`block w-full cursor-pointer truncate rounded-md px-3 py-2 text-left text-sm transition hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:outline-none ${
                                            restaurant.id === selectedRestaurantId
                                                ? "bg-blue-50 font-semibold text-blue-700"
                                                : "text-slate-700"
                                        }`}
                                    >
                                        {restaurant.restaurant_name ?? "Restaurant"}
                                    </button>
                                ),
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <h1 className="ml-auto text-lg font-semibold text-slate-800">
                    {restaurantName}
                </h1>
            )}
        </header>
    );
}
