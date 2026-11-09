import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { useParams,useNavigate } from "react-router-dom";
import { getRestoById } from "../../api/restaurant.ts";
import type { RestaurantFormData, Restuarant, } from "../../types/restaurant.ts";
import { useRestaurant } from "../../components/globals/restaurantContext";


const emptyRestaurant: RestaurantFormData = {
    restaurant_name: "",
    is_active: true,
    address: "",
    email: "",
    contact_number: "",
    country: null,
};

export default function RestaurantCreate() {
    const { id } = useParams();
    const isCreating = !id;
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<RestaurantFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveError, setSaveError] = useState("");
    const { selectedRestaurantId } = useRestaurant();


    useEffect(() => {
        let cancelled = false;

        if (!id) {
            setRestaurant({ ...emptyRestaurant });
            setLoading(false);
            setError("");
            return () => {
                cancelled = true;
            };
        }
        
       
        const restaurantId = Number(id);
        
        if(Number(selectedRestaurantId) != restaurantId){
            navigate(`/restaurant/edit/${selectedRestaurantId}`)
        }
        async function fetchRestaurant() {
            if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
                setError("Invalid restaurant ID");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await getRestoById(restaurantId);
                if (!response.ok) {
                    throw new Error("Failed to fetch restaurant");
                }

                const result: { data?: Restuarant } = await response.json();
                if (!result.data) {
                    throw new Error("Restaurant data was not returned");
                }

                if (!cancelled) {
                    setRestaurant(result.data);
                }
            } catch (fetchError) {
                if (!cancelled) {
                    setError(fetchError instanceof Error ? fetchError.message : "Something went wrong");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchRestaurant();
        return () => {
            cancelled = true;
        };
    }, [id,selectedRestaurantId]);

    function updateRestaurant<K extends keyof RestaurantFormData>(key: K, value: RestaurantFormData[K]) {
        setRestaurant((current) => current ? { ...current, [key]: value } : current);
    }

    function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaveError(
            isCreating
                ? "Restaurant creation is not available because no create API is configured."
                : "Saving restaurant changes is not available because no update API is configured."
        );
    }

    return (
        <main className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-700">
                    {isCreating ? "Create Restaurant" : "Edit Restaurant"}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    {isCreating
                        ? "Enter the details for your new restaurant."
                        : "Update the restaurant information shown below."}
                </p>
            </div>

            {loading ? (
                <div
                    aria-label="Loading restaurant"
                    className="h-56 animate-pulse rounded-xl border border-slate-200 bg-white"
                />
            ) : error ? (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-800"
                >
                    <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                        <h2 className="font-semibold">{error}</h2>
                        <p className="mt-1 text-sm text-rose-700">
                            The restaurant details could not be loaded.
                        </p>
                    </div>
                </div>
            ) : restaurant ? (
                <form
                    onSubmit={handleSave}
                    className="space-y-6"
                >
                    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-700">Restaurant Details</h2>
                        </div>

                        <div>
                            <label htmlFor="restaurantName" className="mb-1 block text-sm font-medium text-slate-600">
                                Restaurant Name
                            </label>
                            <input
                                id="restaurantName"
                                value={restaurant.restaurant_name}
                                onChange={(event) => updateRestaurant("restaurant_name", event.target.value)}
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                            />
                        </div>

                        <div>
                            <label htmlFor="restaurantAddress" className="mb-1 block text-sm font-medium text-slate-600">
                                Address
                            </label>
                            <textarea
                                id="restaurantAddress"
                                value={restaurant.address}
                                onChange={(event) => updateRestaurant("address", event.target.value)}
                                required
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label htmlFor="restaurantEmail" className="mb-1 block text-sm font-medium text-slate-600">
                                    Email
                                </label>
                                <input
                                    id="restaurantEmail"
                                    type="email"
                                    value={restaurant.email}
                                    onChange={(event) => updateRestaurant("email", event.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                                />
                            </div>

                            <div>
                                <label htmlFor="restaurantContact" className="mb-1 block text-sm font-medium text-slate-600">
                                    Contact Number
                                </label>
                                <input
                                    id="restaurantContact"
                                    type="tel"
                                    value={restaurant.contact_number}
                                    onChange={(event) => updateRestaurant("contact_number", event.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-slate-700">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={restaurant.is_active}
                                aria-label="Toggle restaurant status"
                                onClick={() => updateRestaurant("is_active", !restaurant.is_active)}
                                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 ${
                                    restaurant.is_active ? "bg-[#6495ED]" : "bg-slate-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        restaurant.is_active ? "translate-x-6" : "translate-x-1"
                                    }`}
                                />
                            </button>
                            <span>{restaurant.is_active ? "Active" : "Inactive"} restaurant</span>
                        </div>
                    </section>
                    {saveError && (
                        <p role="alert" className="text-sm text-rose-700">
                            {saveError}
                        </p>
                    )}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="cursor-pointer rounded-lg bg-[#6495ED] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                        >
                            {isCreating ? "Create Restaurant" : "Save Changes"}
                        </button>
                    </div>
                </form>
            ) : null}
        </main>
    );
}
