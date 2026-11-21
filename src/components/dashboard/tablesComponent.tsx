
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ChevronDown,
    Armchair,
    Users,
    Plus,
    Utensils,
} from "lucide-react";

import { getRestaurantTables } from "../../api/restaurantTable";
import { getApiErrorMessage } from "../../api/utils";
import { TableLoader } from "../globals/tableLoader";
import {
    TableStatuses,
    tableStatusStyles,
    type TableStatus,
} from "../../types/dashboard";
import { DiningSession, RestaurantTable } from "../../types/restaurant";
import { useRestaurant } from "../globals/restaurantContext";

const TABLE_PAGE_SIZE = 50;

const sortTables = (tables: RestaurantTable[]) => {
    return [...tables].sort((a, b) => {
        const getPriority = (table: RestaurantTable) => {
            if (!table.is_active) return 2;
            if (table.dining_sessions.length > 0) return 1;
            return 0;
        };

        return getPriority(a) - getPriority(b);
    });
};

const statusConfig = {
    available: {
        label: "Available",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
        card: "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 hover:border-emerald-300",
        icon: "text-emerald-600 bg-emerald-100",
    },
    occupied: {
        label: "Occupied",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-100",
        card: "border-amber-100 bg-gradient-to-br from-white to-amber-50/60 hover:border-amber-300",
        icon: "text-amber-600 bg-amber-100",
    },
    inactive: {
        label: "Inactive",
        dot: "bg-slate-400",
        badge: "bg-slate-100 text-slate-600 border-slate-200",
        card: "border-slate-200 bg-slate-50/70 hover:border-slate-300",
        icon: "text-slate-500 bg-slate-200/70",
    },
};

export default function TableOverview() {
    const navigate = useNavigate();
    const { selectedRestaurantId } = useRestaurant();

    const [tableLoad, setTableLoad] = useState(false);
    const [isTableExpanded, setIsTableExpanded] = useState(true);
    const [tablePage] = useState(1);
    const [tables, setTables] = useState<RestaurantTable[]>([]);

    useEffect(() => {
        const handleTableSession = (rawEvent: Event) => {
            const event = rawEvent as CustomEvent<{
                table_id: number;
                session_id: number;
                session_token: string;
                table_name: string;
                is_active: boolean;
                started_at: string;
                closed_at: string | null;
                status: "pending" | "verified" | "closed";
            }>;

            const eventData = event.detail;

            if (!eventData) return;

            setTables((prev) => {
                const updatedTables = prev.map((table) => {
                    if (Number(table.id) !== Number(eventData.table_id)) {
                        return table;
                    }

                    const newSession: DiningSession = {
                        id: eventData.session_id,
                        restaurant_table_id: eventData.table_id,
                        session_token: eventData.session_token,
                        started_at: eventData.started_at,
                        closed_at: eventData.closed_at,
                        is_active: eventData.is_active,
                        status: eventData.status,
                        restaurant_table: table,
                    };

                    const sessionExists = table.dining_sessions.some(
                        (session) =>
                            Number(session.id) === Number(newSession.id),
                    );

                    if (sessionExists) return table;

                    return {
                        ...table,
                        dining_sessions: [
                            ...table.dining_sessions,
                            newSession,
                        ],
                    };
                });

                return sortTables(updatedTables);
            });
        };

        window.addEventListener("dining-session-created", handleTableSession);

        return () => {
            window.removeEventListener(
                "dining-session-created",
                handleTableSession,
            );
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        async function fetchTables() {
            setTableLoad(false);

            try {
                const response = await getRestaurantTables({
                    page: tablePage,
                    page_size: TABLE_PAGE_SIZE,
                });

                if (!response.ok) {
                    console.log(await getApiErrorMessage(response));
                    return;
                }

                const result = await response.json();

                if (!isMounted) return;

                setTables(sortTables(result.data));
            } catch (fetchError) {
                if (isMounted) {
                    console.error(fetchError);
                }
            } finally {
                if (isMounted) {
                    setTableLoad(true);
                }
            }
        }

        fetchTables();

        return () => {
            isMounted = false;
        };
    }, [selectedRestaurantId, tablePage]);

    const availableCount = tables.filter(
        (table) => table.is_active && table.dining_sessions.length === 0,
    ).length;

    const occupiedCount = tables.filter(
        (table) => table.is_active && table.dining_sessions.length > 0,
    ).length;

    const inactiveCount = tables.filter(
        (table) => !table.is_active,
    ).length;

    return (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">
            {/* Header */}
            <button
                type="button"
                onClick={() => setIsTableExpanded((prev) => !prev)}
                className="flex w-full cursor-pointer flex-col gap-4 p-5 text-left transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Armchair size={23} />
                    </div>

                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold tracking-tight text-slate-800">
                                Table Overview
                            </h2>

                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                                {tables.length} tables
                            </span>
                        </div>

                        <p className="mt-0.5 text-sm text-slate-500">
                            Monitor your restaurant's table availability.
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex flex-wrap items-center gap-2">
                        {TableStatuses.map((status) => (
                            <span
                                key={status}
                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium capitalize text-slate-600"
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${tableStatusStyles[status]}`}
                                />
                                {status}
                            </span>
                        ))}
                    </div>

                    <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
                            isTableExpanded ? "rotate-180" : ""
                        }`}
                    />
                </div>
            </button>

            {isTableExpanded && (
                <div className="border-t border-slate-100 px-5 pb-6 pt-5 sm:px-6">
                    {!tableLoad ? (
                        <TableLoader />
                    ) : tables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-12 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                                <Armchair size={30} />
                            </div>

                            <h3 className="mt-4 text-base font-bold text-slate-800">
                                Your tables will appear here
                            </h3>

                            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                                You haven't added any restaurant tables yet.
                                Create your first table to start managing
                                availability and dining sessions.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/table/create")}
                                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#6495ED] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-md"
                            >
                                <Plus size={17} />
                                Add Your First Table
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Table summary */}
                            <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                                    <p className="text-xs font-medium text-emerald-700">
                                        Available
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-emerald-800">
                                        {availableCount}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                                    <p className="text-xs font-medium text-amber-700">
                                        Occupied
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-amber-800">
                                        {occupiedCount}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-xs font-medium text-slate-600">
                                        Inactive
                                    </p>
                                    <p className="mt-1 text-xl font-bold text-slate-700">
                                        {inactiveCount}
                                    </p>
                                </div>
                            </div>

                            {/* Table cards */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {tables.map((table) => {
                                    const status: TableStatus = !table.is_active
                                        ? "inactive"
                                        : table.dining_sessions.length === 0
                                          ? "available"
                                          : "occupied";

                                    const config = statusConfig[status];

                                    return (
                                        <div
                                            key={table.id}
                                            className={`group relative overflow-hidden rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${config.card}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${config.icon}`}>
                                                    <Armchair size={21} />
                                                </div>

                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${config.badge}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                                    {config.label}
                                                </span>
                                            </div>

                                            <div className="mt-4">
                                                <p className="truncate text-base font-bold text-slate-800">
                                                    {table.table_name}
                                                </p>

                                                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Users size={13} />
                                                    <span>
                                                        {table.capacity} seat/s
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center justify-between border-t border-slate-200/70 pt-3">
                                                <span className="text-[11px] font-medium text-slate-400">
                                                    TABLE
                                                </span>

                                                <Utensils
                                                    size={14}
                                                    className="text-slate-400 transition group-hover:text-slate-600"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            )}
        </section>
    );
}
