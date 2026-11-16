import { GetQueryParams } from "./global";

export type TableStatus = "available" | "occupied" | "inactive";

export const TableStatuses: TableStatus[] = [
    "available",
    "occupied",
    "inactive",
];

export type RestaurantTableCards = {
    id: number;
    table_number: string;
    capacity: number;
    status: TableStatus;
};

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
