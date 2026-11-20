import { GetQueryParams } from "./global";
import { OrderWithSession } from "./order";

export type TableStatus = "available" | "occupied" | "inactive";
export type OrderDateFilter = "today" | "week" | "month" | "custom";
export type OrderDateRange = {
    order_from: string;
    order_at: string;
}
export const TableStatuses: TableStatus[] = [
    "available",
    "occupied",
    "inactive",
];

export type OrderChartParams = {
    order_from?: string;
    order_at?: string;
}

export type RestaurantTableCards = {
    id: number;
    table_number: string;
    capacity: number;
    status: TableStatus;
};

export interface OrderDashboardParams extends GetQueryParams {
    order_from?: string;
    order_at?: string;
}

export type RecentOrdersProps = {
    orderDateFilter: OrderDateFilter;
    orderDateFrom: string;
    orderDateTo: string;
    newOrder: OrderWithSession | null;
    recentOrders: OrderWithSession[];
    setRecentOrders: React.Dispatch<
        React.SetStateAction<OrderWithSession[]>
    >;
    // onTotalOrdersChange: (total: number) => void;
}
// interface OrderChartProps {
//     chartData: OrderChartItem[];
// }
export type OrderChartItem = {
    hour: number;
    time: string;
    orders: number;
}

export type OrderInsights = {
    revenue: number;
    average_order_value: number;
    completed: number;
    canceled: number;
    pending: number;
    preparing: number;
}

export type OrderCreatedEventDetail = {
    order: OrderWithSession;
};

export type UserUpdatedProps = {
    recentOrders: OrderWithSession[];
    totalOrders: number;
    setRecentOrders: React.Dispatch<
        React.SetStateAction<OrderWithSession[]>
    >;
    setOrderInsights: React.Dispatch<
        React.SetStateAction<OrderInsights>
    >;
}


export type UseOrderCreatedProps = {
    dateRange: {
        order_from: string;
        order_at?: string;
    } | null;
    orderDateFilter: OrderDateFilter;
    totalOrders: number;
    setNewOrder: React.Dispatch<
        React.SetStateAction<OrderWithSession | null>
    >;
    setTotalOrders: React.Dispatch<React.SetStateAction<number>>;
    setChartData: React.Dispatch<
        React.SetStateAction<OrderChartItem[]>
    >;
    setOrderInsights: React.Dispatch<
        React.SetStateAction<OrderInsights>
    >;
}

export const tableStatusStyles: Record<TableStatus, string> = {
    available: "bg-green-500",
    occupied: "bg-blue-500",
    inactive: "bg-slate-400",
    
};

export const tableStatusStylesCard: Record<TableStatus, string> = {
    available: "border-green-200 bg-green-50 text-green-700",
    occupied: "border-blue-200 bg-blue-50 text-blue-700",
    inactive: "border-slate-200 bg-slate-100 text-slate-500",
};

export const orderStatusStyles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    preparing: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    ready: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    served: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
    canceled: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
};
