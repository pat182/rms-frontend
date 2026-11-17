import { GetQueryParams } from "./global";

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
