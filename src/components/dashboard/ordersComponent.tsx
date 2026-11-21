
import { useEffect, useRef, useState } from "react";
import { ClipboardList, ShoppingBag } from "lucide-react";

import { getRecentOrders } from "../../api/dashboard";
import { getApiErrorMessage } from "../../api/utils";
import { TableLoader } from "../globals/tableLoader";
import { useRestaurant } from "../globals/restaurantContext";

import {
    orderStatusStyles,
    RecentOrdersProps,
} from "../../types/dashboard";

import { OrderWithSession } from "../../types/order";
import { handleInfiniteScroll } from "../../utils/helper";

import { useOrderDateRange } from "../../hooks/dashboard/useOrderDateRange";
import OrdersModal from "../customerOrders/ordersModal.tsx";
import { DiningSession } from "../../types/restaurant.ts";

const RECENT_ORDER_PAGE_SIZE = 10;

export default function RecentOrders({
    orderDateFilter,
    orderDateFrom,
    orderDateTo,
    newOrder,
    recentOrders,
    setRecentOrders,
}: RecentOrdersProps) {
    const { selectedRestaurantId } = useRestaurant();
    const [selectedSession, setSelectedSession] = useState<DiningSession | null>(null);

    const [recentOrdersLoad, setRecentOrderLoad] = useState(false);
    const [recentOrderPage, setRecentOrderPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);

    const isFetchingMoreOrders = useRef(false);
    const recentOrdersRequestId = useRef(0);

    const processedOrderIds = useRef<Set<string | number>>(new Set());

    const dateRange = useOrderDateRange(
        orderDateFilter,
        orderDateFrom,
        orderDateTo,
    );

    const handleRecentOrdersScroll = (
        e: React.UIEvent<HTMLElement>,
    ) => {
        handleInfiniteScroll({
            element: e.currentTarget,
            loading: loadingMoreOrders || isFetchingMoreOrders.current,
            hasMore: recentOrders.length < totalOrders,
            onLoadMore: () => {
                isFetchingMoreOrders.current = true;
                setRecentOrderPage((prev) => prev + 1);
            },
        });
    };

    // Reset pagination when the selected restaurant or date range changes.
    useEffect(() => {
        isFetchingMoreOrders.current = false;
        setLoadingMoreOrders(false);
        setRecentOrderPage(1);
    }, [selectedRestaurantId, dateRange]);

    // Add a newly received order to the top of the list.
    useEffect(() => {
        if (!newOrder) return;

        if (processedOrderIds.current.has(newOrder.id)) return;

        processedOrderIds.current.add(newOrder.id);

        setRecentOrders((prev) => [
            newOrder,
            ...prev.filter((order) => order.id !== newOrder.id),
        ]);

        setTotalOrders((prev) => prev + 1);
    }, [newOrder, setRecentOrders]);

    // Fetch recent orders.
    useEffect(() => {
        const requestId = ++recentOrdersRequestId.current;
        
        async function fetchRecentOrders() {
            const isFirstPage = recentOrderPage === 1;

            if (isFirstPage) {
                setRecentOrderLoad(false);
            } else {
                setLoadingMoreOrders(true);
            }

            if (!dateRange) {
                if (requestId === recentOrdersRequestId.current) {
                    setRecentOrders([]);
                    setTotalOrders(0);
                    processedOrderIds.current.clear();
                    setRecentOrderLoad(true);
                    setLoadingMoreOrders(false);
                    isFetchingMoreOrders.current = false;
                }

                return;
            }

            try {
                const response = await getRecentOrders({
                    page: recentOrderPage,
                    page_size: RECENT_ORDER_PAGE_SIZE,
                    ...dateRange,
                });

                if (requestId !== recentOrdersRequestId.current) return;

                if (!response.ok) {
                    console.error(await getApiErrorMessage(response));
                    return;
                }

                const result = await response.json();

                if (requestId !== recentOrdersRequestId.current) return;

                const newOrders: OrderWithSession[] = result.data ?? [];

                // Track IDs returned by the API to avoid inserting them twice.
                newOrders.forEach((order) => {
                    processedOrderIds.current.add(order.id);
                });

                setRecentOrders((prev) =>
                    isFirstPage
                        ? newOrders
                        : [
                              ...prev,
                              ...newOrders.filter(
                                  (order) =>
                                      !prev.some(
                                          (existingOrder) =>
                                              existingOrder.id === order.id,
                                      ),
                              ),
                          ],
                );
                
                setTotalOrders(result.total_items);
                // console.log(recentOrders)
            } catch (error) {
                if (requestId === recentOrdersRequestId.current) {
                    console.error(error);
                }
            } finally {
                if (requestId === recentOrdersRequestId.current) {
                    setRecentOrderLoad(true);
                    setLoadingMoreOrders(false);
                    isFetchingMoreOrders.current = false;
                }
            }
        }

        fetchRecentOrders();

        return () => {
            recentOrdersRequestId.current++;
        };
    }, [
        selectedRestaurantId,
        recentOrderPage,
        dateRange,
        setRecentOrders,
    ]);

    return (
        <section
            onScroll={handleRecentOrdersScroll}
            className="min-h-[750px] max-h-[750px] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 custom-scrollbar"
        >
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-800">
                    Recent Orders
                </h2>

                <p className="text-sm text-slate-500">
                    Latest restaurant orders.
                </p>
            </div>

            {!recentOrdersLoad ? (
                <div className="flex min-h-[300px] items-center justify-center">
                    <TableLoader />
                </div>
            ) : recentOrders.length === 0 ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                        <ShoppingBag className="h-7 w-7" />
                    </div>

                    <h3 className="mt-2 text-base font-semibold text-slate-800">
                        No orders just yet
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                        Your next order could be just around the corner.
                        Once customers start placing orders, you'll see
                        them here.
                    </p>
                </div>
            ) : (
                
                <div className="space-y-3">
                    {recentOrders.map((order) => (
                        <div
                            key={order.id}
                            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-bold text-slate-800">
                                            Order #{order.id}
                                        </p>
                                        <span className="text-xs text-slate-400">
                                            Session #{order.dining_session.id}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm font-medium text-slate-600">
                                        {order.dining_session.restaurant_table.table_name}
                                    </p>

                                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                                        <p>
                                            Session started:{" "}
                                            {new Date(
                                                order.dining_session.started_at
                                            ).toLocaleString()}
                                        </p>
                                        <p>
                                            Order placed:{" "}
                                            {new Date(order.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-bold text-slate-800">
                                        ₱{Number(order.subtotal).toLocaleString("en-PH", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {order.items?.length ?? 0}{" "}
                                        {(order.items?.length ?? 0) === 1 ? "item" : "items"}
                                    </p>

                                    <span
                                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                            orderStatusStyles[order.status]
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                                <button
                                    onClick={() => setSelectedSession(order.dining_session)}
                                    type="button"
                                    className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:border-blue-200 hover:bg-blue-100"
                                >
                                    <ClipboardList aria-hidden="true" size={14} />
                                    View Session
                                    <span aria-hidden="true">→</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {loadingMoreOrders && (
                        <div className="flex justify-center py-4">
                            <TableLoader />
                        </div>
                    )}
                </div>

            )}
        {selectedSession && (
            <OrdersModal
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
            />
        )}
        </section>
    );
}
