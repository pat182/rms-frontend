
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Menu } from "lucide-react";
import {
    diningSeshActionMsg,
    type DiningSessionCreatedMessage,
    type SideBarProps,
    type HeaderNotification,
} from "../../types/global";
import { useRestaurant } from "./restaurantContext";
import { useNavigate } from "react-router-dom";
import { connectAdminWebSocket } from "../../utils/websocket";
import { extendDiningSession, updateDiningSessionStatus } from "../../api/restaurantTable";
import { useToast } from "./toastContext";
import { getApiErrorMessage } from "../../api/utils";

export default function TopBar({
    sidebarOpen,
    setSidebarOpen,
}: SideBarProps) {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const restaurants = Array.isArray(user?.restaurants) ? user.restaurants : [];

    const {
        selectedRestaurantId,
        setSelectedRestaurantId,
        setDropdownOpen,
        dropdownOpen,
        notificationsOpen,
        setNotificationsOpen
    } = useRestaurant();

    
    // const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const notificationsRef = useRef<HTMLDivElement>(null);

    const restaurantName = restaurants.find(
        (restaurant: { id: number }) => restaurant.id === selectedRestaurantId,
    )?.restaurant_name ?? "Restaurant";

    const handleSessionExtend = async (
        session : HeaderNotification,
    ) => {
        
        try{
            const response = await extendDiningSession(session.content.session_token);

            if (!response.ok) {
                showToast(`Unable to extend dining session`, "error");
                return;
            }

            window.dispatchEvent(
                new CustomEvent("dining-session-status-updated", {
                    detail: { 
                        session_id: session.content.session_id,
                        status : session.content.status
                    },
                }),
            );
            setNotifications((current) =>
                current.filter(
                    (item) => item.content.session_id !==session.content.session_id,
                ),
            );
            showToast("Dining Session Extended","success");
        }catch (statusError){
            showToast(
                statusError instanceof Error ? statusError.message : "Unable to update the dining session.",
                "error"
            );
        }
    }

    const updateNotificationStatus = async (
        notification: HeaderNotification,
        action: "accept" | "reject",
    ) => {
        try {
            const status = action === "accept" ? "verified" : "closed";

            const response = await updateDiningSessionStatus(
                notification.content.session_token,
                status,
            );

            if (!response.ok) {
                showToast(`Unable to ${action} the dining session. Please try again.`, "error");
                return;
            }

            // Notify other components about the status change.
            window.dispatchEvent(
                new CustomEvent("dining-session-status-updated", {
                    detail: {
                        session_id: notification.content.session_id,
                        status,
                    },
                }),
            );

            // Remove the notification after updating its status.
            setNotifications((current) =>
                current.filter(
                    (item) => item.content.session_id !== notification.content.session_id,
                ),
            );

            showToast(
                `Dining session ${action === "accept" ? "accepted" : "rejected"}.`,
                "success",
            );
        } catch {
            showToast(`Unable to ${action} the dining session. Please try again.`, "error");
        }
    };

    useEffect(() => {
        const handleDiningSessionStatusUpdated = (event: Event) => {
            const { session_id } = (
                event as CustomEvent<{ session_id: number }>
            ).detail;
            setNotifications((current) =>
                current.filter(
                    (notification) => notification.content.session_id !== session_id,
                ),
            );
        };

        window.addEventListener(
            "dining-session-status-updated",
            handleDiningSessionStatusUpdated,
        );

        return () => {
            window.removeEventListener(
                "dining-session-status-updated",
                handleDiningSessionStatusUpdated,
            );
        };
    }, []);

    useEffect(() => {
        if (selectedRestaurantId == null) return;

        setNotifications([]);

        const socket = connectAdminWebSocket(
            `admin_notification/${selectedRestaurantId}`,
            (message: DiningSessionCreatedMessage) => {
                if (message.event === "dining_session_created") {
                    const session = message.data.dining_session;
                    const action = message.data.action;

                    if (action === "created") {
                        window.dispatchEvent(
                            new CustomEvent("dining-session-created", {
                                detail: message.data,
                            }),
                        );
                    }

                    if (action === "expired") {
                        window.dispatchEvent(
                            new CustomEvent("dining-session-status-updated", {
                                detail: {
                                    session_id: session.session_id,
                                    status: session.status,
                                },
                            }),
                        );

                        setNotifications((current) =>
                            current.filter(
                                (item) => item.content.session_id !== session.session_id,
                            ),
                        );

                        return;
                    }

                    if (action === "expiration_warn") {
                        
                        window.dispatchEvent(
                            new CustomEvent("dining-session-expiration-warning", {
                                detail: {
                                    dining_session: message.data.dining_session,
                                    action: "expiration_warn",
                                },
                            })
                        );
                    }

                    const notificationId = `${session.session_id}-${action}`;

                    setNotifications((current) => [
                        {
                            id: notificationId,
                            title: diningSeshActionMsg[action],
                            content: session,
                            action,
                            receivedAt: new Date().toLocaleTimeString(),
                        },
                        ...current.filter((item) => item.id !== notificationId),
                    ]);
                }

                if (message.event === "order_created") {
                    window.dispatchEvent(
                        new CustomEvent("order-created", {
                            detail: message.data,
                        }),
                    );
                }

                if (message.event === "order_updated") {
                    window.dispatchEvent(
                        new CustomEvent("order-updated", {
                            detail: message.data,
                        }),
                    );
                }
            },
        );

        return () => {
            socket.close();
        };
    }, [selectedRestaurantId]);

    useEffect(() => {
        if (!dropdownOpen && !notificationsOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;

            if (dropdownOpen && !dropdownRef.current?.contains(target)) {
                setDropdownOpen(false);
            }

            if (notificationsOpen && !notificationsRef.current?.contains(target)) {
                setNotificationsOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
        };
    }, [dropdownOpen, notificationsOpen]);

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

            <div className="ml-auto flex h-10 items-center gap-3">
                {restaurants.length > 1 ? (
                    <div
                        ref={dropdownRef}
                        className="relative"
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
                                className={`shrink-0 text-slate-500 transition-transform ${
                                    dropdownOpen ? "rotate-180" : ""
                                }`}
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
                    <h1 className="text-lg font-semibold text-slate-800">
                        {restaurantName}
                    </h1>
                )}

                <div
                    ref={notificationsRef}
                    className="relative"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") setNotificationsOpen(false);
                    }}
                >
                    <button
                        type="button"
                        aria-label={`Notifications${notifications.length ? `, ${notifications.length}` : ""}`}
                        aria-expanded={notificationsOpen}
                        aria-haspopup="dialog"
                        onClick={() => setNotificationsOpen((open) => !open)}
                        className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <Bell size={19} strokeWidth={1.8} aria-hidden="true" />

                        {notifications.length > 0 && (
                            <span className="absolute -right-2 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] leading-none font-semibold text-white shadow-sm">
                                {notifications.length > 99 ? "99+" : notifications.length}
                            </span>
                        )}
                    </button>

                    {notificationsOpen && (
                        <section
                            role="dialog"
                            aria-label="Notifications"
                            className="absolute right-0 z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Notifications
                                </h2>

                                {notifications.length > 0 && (
                                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                        {notifications.length}
                                    </span>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <p className="px-4 py-6 text-center text-sm text-slate-500">
                                    No notifications yet.
                                </p>
                            ) : (
                                <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
                                    {notifications.map((notification) => (
                                        <li
                                            key={notification.id}
                                            className="px-4 py-4 transition hover:bg-slate-50"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold text-slate-800">
                                                        {notification.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Table {notification.content.table_name}
                                                    </p>
                                                </div>

                                                <time className="shrink-0 text-xs text-slate-400">
                                                    {notification.receivedAt}
                                                </time>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs">
                                                <span className="font-medium text-slate-600">
                                                    Session #{notification.content.session_id}
                                                </span>

                                                <span className="rounded-full bg-white px-2 py-1 font-medium capitalize text-slate-600 ring-1 ring-slate-200">
                                                    {notification.content.status}
                                                </span>
                                            </div>

                                            {notification.action === "created" && (
                                                <>
                                                    <p className="mt-3 text-xs leading-relaxed text-slate-500">
                                                        A new dining session has started. Verify the session and take the necessary actions.
                                                    </p>

                                                    <div className="mt-3 flex items-center gap-4 text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void updateNotificationStatus(notification, "accept")
                                                            }
                                                            className="cursor-pointer text-green-600 transition hover:text-green-700 hover:underline focus:outline-none focus:underline"
                                                        >
                                                            Accept
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void updateNotificationStatus(notification, "reject")
                                                            }
                                                            className="cursor-pointer text-red-600 transition hover:text-red-700 hover:underline focus:outline-none focus:underline"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </>
                                            )}

                                            {notification.action === "expiration_warn" && (
                                                <>
                                                    <p className="mt-3 text-xs leading-relaxed text-amber-700">
                                                        This dining session will expire in 5 minutes. Extend the session to keep it active.
                                                    </p>

                                                    <div className="mt-3 flex items-center gap-4 text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            onClick={() =>  void handleSessionExtend(notification)}
                                                            className="cursor-pointer text-blue-600 transition hover:text-blue-700 hover:underline focus:outline-none focus:underline"
                                                        >
                                                            Extend
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </header>
    );
}
