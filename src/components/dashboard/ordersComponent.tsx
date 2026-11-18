
import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";

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

const RECENT_ORDER_PAGE_SIZE = 10;

export default function RecentOrders({
    orderDateFilter,
    orderDateFrom,
    orderDateTo,
    newOrder,
}: RecentOrdersProps) {
    const { selectedRestaurantId } = useRestaurant();

    const [recentOrdersLoad, setRecentOrderLoad] = useState(false);
    const [recentOrders, setRecentOrders] = useState<OrderWithSession[]>([]);
    const [recentOrderPage, setRecentOrderPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);

    const isFetchingMoreOrders = useRef(false);
    const recentOrdersRequestId = useRef(0);

    // FIX: OrderWithSession.id accepts string | number.
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
            loading:
                loadingMoreOrders || isFetchingMoreOrders.current,
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
    }, [newOrder]);

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
                <div className="space-y-4">
                    {recentOrders.map((order) => (
                        <div
                            key={order.id}
                            className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                        >
                            <div className="min-w-0 flex-1 space-y-1.5">
                                <p className="text-sm font-semibold text-slate-800">
                                    Session #{order.dining_session.id} . Order #{order.id}
                                </p>

                                <p className="text-sm text-slate-600">
                                    {order.dining_session.restaurant_table.table_name}
                                </p>

                                <div className="flex flex-col gap-1 text-xs text-slate-500">
                                    <span>
                                        Session started:{" "}
                                        {new Date(
                                            order.dining_session.started_at,
                                        ).toLocaleString()}
                                    </span>

                                    <span>
                                        Order placed:{" "}
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div className="shrink-0 space-y-2 text-right">
                                <p className="text-sm font-semibold text-slate-800">
                                    {Number(order.subtotal).toLocaleString(
                                        "en-PH",
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        },
                                    )}
                                </p>

                                <p className="text-xs text-slate-500">
                                    {order.items?.length ?? 0}{" "}
                                    {(order.items?.length ?? 0) === 1
                                        ? "item"
                                        : "items"}
                                </p>

                                <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                        orderStatusStyles[order.status]
                                    }`}
                                >
                                    {order.status}
                                </span>
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
        </section>
    );
}
