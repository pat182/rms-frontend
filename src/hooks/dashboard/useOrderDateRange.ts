import { useMemo } from "react";

import {
    OrderDateFilter,
    OrderDateRange,
} from "../../types/dashboard";

import { toLocalISO } from "../../utils/helper";

export function useOrderDateRange(
    filter: OrderDateFilter,
    fromDate: string,
    toDate: string,
): OrderDateRange | null {
    return useMemo(() => {
        if (filter === "custom") {
            if (!fromDate || !toDate) {
                return null;
            }

            const from = new Date(`${fromDate}T00:00:00`);
            const to = new Date(`${toDate}T23:59:59.999`);

            if (
                Number.isNaN(from.getTime()) ||
                Number.isNaN(to.getTime()) ||
                from > to
            ) {
                return null;
            }

            return {
                order_from: toLocalISO(from),
                order_at: toLocalISO(to),
            };
        }

        const now = new Date();
        const from = new Date(now);

        if (filter === "today") {
            from.setHours(0, 0, 0, 0);
        } else if (filter === "week") {
            const day = from.getDay();
            const daysSinceMonday = (day + 6) % 7;

            from.setDate(from.getDate() - daysSinceMonday);
            from.setHours(0, 0, 0, 0);
        } else if (filter === "month") {
            from.setDate(1);
            from.setHours(0, 0, 0, 0);
        }

        return {
            order_from: toLocalISO(from),
            order_at: toLocalISO(now),
        };
    }, [filter, fromDate, toDate]);
}