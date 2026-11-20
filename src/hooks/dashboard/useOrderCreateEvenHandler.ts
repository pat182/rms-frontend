
import { useEffect } from "react";

import {
    OrderCreatedEventDetail,
    UseOrderCreatedProps,
} from "../../types/dashboard";


export function useOrderCreated({
    dateRange,
    orderDateFilter,
    totalOrders,
    setNewOrder,
    setTotalOrders,
    setChartData,
    setOrderInsights,
}: UseOrderCreatedProps) {
    useEffect(() => {
        const handleOrderCreated = (rawEvent: Event) => {
            const event = rawEvent as CustomEvent<OrderCreatedEventDetail>;

            const order = event.detail?.order;

            if (!order) return;

            const orderDate = new Date(order.created_at);

            if (Number.isNaN(orderDate.getTime())) return;

            if (!dateRange?.order_from) return;

            const rangeStart = new Date(dateRange.order_from);

            if (
                Number.isNaN(rangeStart.getTime()) ||
                orderDate < rangeStart
            ) {
                return;
            }

            if (orderDateFilter === "custom") {
                if (!dateRange.order_at) return;

                const rangeEnd = new Date(dateRange.order_at);

                if (
                    Number.isNaN(rangeEnd.getTime()) ||
                    orderDate > rangeEnd
                ) {
                    return;
                }
            }

            setNewOrder(order);
            console.log("ORDER CREATED EVENT:", order);


            const localHour = orderDate.getHours();
            const orderSubtotal = Number(order.subtotal) || 0;
            const orderStatus = order.status.toLowerCase();

            setTotalOrders((prev) => prev + 1);

            setChartData((prev) =>
                prev.map((item) =>
                    item.hour === localHour
                        ? { ...item, orders: item.orders + 1 }
                        : item,
                ),
            );

            setOrderInsights((prev) => {
                const isPending = orderStatus === "pending";

                const updatedRevenue = isPending
                    ? prev.revenue
                    : prev.revenue + orderSubtotal;

                const updatedTotalOrders = totalOrders + 1;

                return {
                    ...prev,
                    revenue: updatedRevenue,
                    average_order_value:
                        updatedTotalOrders > 0
                            ? updatedRevenue / updatedTotalOrders
                            : 0,
                    pending: prev.pending + (isPending ? 1 : 0),
                    preparing:
                        prev.preparing +
                        (orderStatus === "preparing" ? 1 : 0),
                    completed:
                        prev.completed +
                        (orderStatus === "completed" ? 1 : 0),
                    canceled:
                        prev.canceled +
                        (orderStatus === "canceled" ? 1 : 0),
                };
            });
        };
        window.addEventListener("order-created", handleOrderCreated);

        return () => {
            window.removeEventListener(
                "order-created",
                handleOrderCreated,
            );
        };
    }, [
        dateRange,
        orderDateFilter,
        totalOrders,
        setNewOrder,
        setTotalOrders,
        setChartData,
        setOrderInsights,
    ]);
}
