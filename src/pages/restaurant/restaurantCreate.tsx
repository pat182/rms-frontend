
import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getRestoById, updateRestaurantApi } from "../../api/restaurant.ts";
import type {
    RestaurantFormData,
    Restuarant,
} from "../../types/restaurant.ts";
import { useRestaurant } from "../../components/globals/restaurantContext";
import { useToast } from "../../components/globals/toastContext.tsx";
import { validateRestaurantUpdate } from "../../components/restaurant/validations/updateRestaurantValidation.ts";
import { sanitizeContactNumber } from "../../utils/helper.ts";

const emptyRestaurant: RestaurantFormData = {
    restaurant_name: "",
    is_active: true,
    address: "",
    email: "",
    contact_number: "",
    country: null,
    country_id: null,
    configuration: null,
};

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export default function RestaurantCreate() {
    const { id } = useParams();
    const isCreating = !id;
    const navigate = useNavigate();

    const [restaurant, setRestaurant] = useState<RestaurantFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { selectedRestaurantId } = useRestaurant();
    const { showToast } = useToast();

    const configuration = restaurant?.configuration;

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

        if (Number(selectedRestaurantId) !== restaurantId) {
            navigate(`/restaurant/edit/${selectedRestaurantId}`);
            return;
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
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Something went wrong"
                    );
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
    }, [id, selectedRestaurantId, navigate]);

    function updateRestaurant<K extends keyof RestaurantFormData>(
        key: K,
        value: RestaurantFormData[K]
    ) {
        setRestaurant((current) =>
            current ? { ...current, [key]: value } : current
        );
    }

    function updateOperatingHours(
        hoursId: number,
        field: "opening_time" | "closing_time" | "is_closed",
        value: string | boolean
    ) {
        setRestaurant((current) => {
            if (!current?.configuration) return current;

            return {
                ...current,
                configuration: {
                    ...current.configuration,
                    operating_hours:
                        current.configuration.operating_hours.map((hours) =>
                            hours.id === hoursId
                                ? { ...hours, [field]: value }
                                : hours
                        ),
                },
            };
        });
    }

    async function handleSave(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (restaurant == null) {
            showToast(
                isCreating
                    ? "Unable to add restaurant"
                    : "Unable to update restaurant",
                "error"
            );
            return;
        }

        // try {
            if (isCreating) {
                showToast(
                    "Restaurant creation is not available because no create API is configured.",
                    "error"
                );
                return;
            }

            const validationError = validateRestaurantUpdate(restaurant);

            if (validationError) {
                showToast(validationError, "error");
                return;
            }

            const payload = {
                email: restaurant.email,
                restaurant_name: restaurant.restaurant_name.trim(),
                contact_number: restaurant.contact_number,
                address: restaurant.address,
                is_active: restaurant.is_active ?? false,
                country: null,
                country_id: 1,
                configuration: restaurant.configuration,
            };
            console.log(payload)
            // const response = await updateRestaurantApi(payload);
            // const data = await response.json();

            // if (!response.ok) {
            //     showToast(
            //         data?.data?.detail ?? "Failed to update restaurant.",
            //         "error"
            //     );
            //     return;
            // }

            showToast("Restaurant successfully updated", "success");
        // } catch (error) {
        //     showToast(
        //         error instanceof Error
        //             ? error.message
        //             : "Failed to update restaurant.",
        //         "error"
        //     );
        // }
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
                    <AlertCircle
                        aria-hidden="true"
                        className="mt-0.5 h-5 w-5 shrink-0"
                    />

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
                    noValidate
                >
                    {/* Restaurant Details */}
                    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-700">
                                Restaurant Details
                            </h2>
                        </div>

                        <div>
                            <label
                                htmlFor="restaurantName"
                                className="mb-1 block text-sm font-medium text-slate-600"
                            >
                                Restaurant Name
                            </label>

                            <input
                                id="restaurantName"
                                value={restaurant.restaurant_name}
                                onChange={(event) =>
                                    updateRestaurant(
                                        "restaurant_name",
                                        event.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="restaurantAddress"
                                className="mb-1 block text-sm font-medium text-slate-600"
                            >
                                Address
                            </label>

                            <textarea
                                id="restaurantAddress"
                                value={restaurant.address}
                                onChange={(event) =>
                                    updateRestaurant("address", event.target.value)
                                }
                                required
                                rows={3}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                            />
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="restaurantEmail"
                                    className="mb-1 block text-sm font-medium text-slate-600"
                                >
                                    Email
                                </label>

                                <input
                                    id="restaurantEmail"
                                    type="email"
                                    value={restaurant.email ?? ""}
                                    onChange={(event) =>
                                        updateRestaurant("email", event.target.value)
                                    }
                                    required
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="restaurantContact"
                                    className="mb-1 block text-sm font-medium text-slate-600"
                                >
                                    Contact Number
                                </label>

                                <input
                                    id="restaurantContact"
                                    type="tel"
                                    value={restaurant.contact_number}
                                    onChange={(event) =>
                                        updateRestaurant(
                                            "contact_number",
                                            sanitizeContactNumber(event.target.value)
                                        )
                                    }
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
                                onClick={() =>
                                    updateRestaurant("is_active", !restaurant.is_active)
                                }
                                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 ${
                                    restaurant.is_active
                                        ? "bg-[#6495ED]"
                                        : "bg-slate-300"
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                        restaurant.is_active
                                            ? "translate-x-6"
                                            : "translate-x-1"
                                    }`}
                                />
                            </button>

                            <span>
                                {restaurant.is_active ? "Active" : "Inactive"} restaurant
                            </span>
                        </div>
                    </section>

                    {/* Restaurant Configuration */}
                    <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-700">
                                Restaurant Configuration
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage your restaurant's operating schedule.
                            </p>
                        </div>

                        {configuration ? (
                            <>
                                {/* 24 Hours Toggle */}
                                <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
                                    <div>
                                        <h3 className="font-medium text-slate-700">
                                            Open 24 Hours
                                        </h3>

                                        <p className="text-sm text-slate-500">
                                            Restaurant operates all day, every day.
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        role="switch"
                                        aria-checked={configuration.is_24_hours}
                                        onClick={() => {
                                            setRestaurant((current) => {
                                                if (!current?.configuration) return current;

                                                return {
                                                    ...current,
                                                    configuration: {
                                                        ...current.configuration,
                                                        is_24_hours:
                                                            !current.configuration.is_24_hours,
                                                    },
                                                };
                                            });
                                        }}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            configuration.is_24_hours
                                                ? "bg-[#6495ED]"
                                                : "bg-slate-300"
                                        }`}
                                    >
                                        <span
                                            className={`cursor-pointer inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                configuration.is_24_hours
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                </div>

                                {/* Operating Hours */}
                                {!configuration.is_24_hours && (
                                    <div className="space-y-3">
                                        <h3 className="font-medium text-slate-700">
                                            Weekly Operating Hours
                                        </h3>

                                        {configuration.operating_hours
                                            .slice()
                                            .sort(
                                                (a, b) =>
                                                    a.day_of_week - b.day_of_week
                                            )
                                            .map((hours) => (
                                                <div
                                                    key={hours.id}
                                                    className="grid grid-cols-1 items-center gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[120px_1fr_auto]"
                                                >
                                                    <span className="font-medium text-slate-700">
                                                        {days[hours.day_of_week] ?? "Unknown day"}
                                                    </span>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="mb-1 block text-xs text-slate-500">
                                                                Opening Time
                                                            </label>

                                                            <input
                                                                type="time"
                                                                value={hours.opening_time ?? ""}
                                                                onChange={(event) =>
                                                                    updateOperatingHours(
                                                                        hours.id,
                                                                        "opening_time",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-400 focus:border-[#6495ED]"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="mb-1 block text-xs text-slate-500">
                                                                Closing Time
                                                            </label>

                                                            <input
                                                                type="time"
                                                                value={hours.closing_time ?? ""}
                                                                onChange={(event) =>
                                                                    updateOperatingHours(
                                                                        hours.id,
                                                                        "closing_time",
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors hover:border-slate-400 focus:border-[#6495ED]"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 sm:mb-2 sm:self-end sm:justify-end">
                                                        <button
                                                            type="button"
                                                            role="switch"
                                                            aria-checked={!hours.is_closed}
                                                            aria-label={`Toggle ${days[hours.day_of_week]} operating status`}
                                                            onClick={() =>
                                                                updateOperatingHours(
                                                                    hours.id,
                                                                    "is_closed",
                                                                    !hours.is_closed
                                                                )
                                                            }
                                                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full shadow-inner transition-colors duration-200 ${
                                                                !hours.is_closed ? "bg-[#6495ED]" : "bg-slate-300"
                                                            }`}
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ${
                                                                    !hours.is_closed ? "translate-x-6" : "translate-x-1"
                                                                }`}
                                                            />
                                                        </button>

                                                        <span
                                                            className={`inline-flex min-w-16 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                                                hours.is_closed
                                                                    ? "border-rose-200 bg-rose-50 text-rose-700"
                                                                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                                            }`}
                                                        >
                                                            {hours.is_closed ? "Closed" : "Open"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                                No restaurant configuration available.
                            </p>
                        )}
                    </section>

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
