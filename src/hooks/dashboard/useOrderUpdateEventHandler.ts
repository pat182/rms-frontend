import { useEffect } from "react";

import {
    OrderCreatedEventDetail,
    UserUpdatedProps,
} from "../../types/dashboard";

export function useOrderUpdated({
    recentOrders,
    setRecentOrders,
    setOrderInsights,
    totalOrders,
}: UserUpdatedProps) {
    
    useEffect(() => {
        const handleOrderUpdated = (rawEvent: Event) => {
            const event = rawEvent as CustomEvent<OrderCreatedEventDetail>;

            const order = event.detail?.order;

            if (!order) return;

            const previousOrder = recentOrders.find(
                (existingOrder) => existingOrder.id === order.id,
            );

            if (!previousOrder) {
                return;
            }

            const previousStatus = previousOrder.status.toLowerCase();
            const newStatus = order.status.toLowerCase();

            const subtotal = Number(previousOrder.subtotal) || 0;

            // Update the matching order in Recent Orders.
            setRecentOrders((prev) =>
                prev.map((existingOrder) =>
                    existingOrder.id === order.id
                        ? { ...existingOrder, ...order }
                        : existingOrder,
                ),
            );
            console.log(order)
            console.log(recentOrders);
            if (previousStatus === newStatus) return;

            setOrderInsights((prev) => {
                const updated = { ...prev };

                if (previousStatus === "pending") updated.pending = Math.max(0, updated.pending - 1);
                if (previousStatus === "preparing") updated.preparing = Math.max(0, updated.preparing - 1);
                if (previousStatus === "served") updated.completed = Math.max(0, updated.completed - 1);
                if (previousStatus === "canceled") updated.canceled = Math.max(0, updated.canceled - 1);

                if (newStatus === "pending") updated.pending += 1;
                if (newStatus === "preparing") updated.preparing += 1;
                if (newStatus === "served") updated.completed += 1;
                if (newStatus === "canceled") updated.canceled += 1;

                const previousRevenue = previousStatus !== "served" ? 0 : subtotal;

                const newRevenue = newStatus !== "served" ? 0 : subtotal;

                updated.revenue += newRevenue - previousRevenue;

                updated.average_order_value = totalOrders > 0 ? updated.revenue / totalOrders : 0;

                return updated;
            });
        };

        window.addEventListener("order-updated", handleOrderUpdated);

        return () => {
            window.removeEventListener(
                "order-updated",
                handleOrderUpdated,
            );
        };
    }, [
        recentOrders,
        setRecentOrders,
        setOrderInsights,
        totalOrders,
    ]);
}