
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Armchair } from "lucide-react";

import { getRestaurantTables } from "../../api/restaurantTable";
import { getApiErrorMessage } from "../../api/utils";
import { TableLoader } from "../globals/tableLoader";
import {
    TableStatuses,
    tableStatusStyles,
    tableStatusStylesCard,
    type TableStatus,
} from "../../types/dashboard";
import { RestaurantTable } from "../../types/restaurant";
import { useRestaurant } from "../globals/restaurantContext";

const TABLE_PAGE_SIZE = 50;

export default function TableOverview() {
    const navigate = useNavigate();
    const { selectedRestaurantId } = useRestaurant();

    const [tableLoad, setTableLoad] = useState(false);
    const [isTableExpanded, setIsTableExpanded] = useState(true);
    const [tablePage] = useState(1);
    const [tables, setTables] = useState<RestaurantTable[]>([]);

    useEffect(() => {
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

                const sortedTables = [...result.data].sort((a, b) => {
                    const getPriority = (table: typeof a) => {
                        if (!table.is_active) return 2;
                        if (table.dining_sessions.length > 0) return 1;
                        return 0;
                    };

                    return getPriority(a) - getPriority(b);
                });

                setTables(sortedTables);
            } catch (fetchError) {
                console.error(fetchError);
            } finally {
                setTableLoad(true);
            }
        }

        fetchTables();
    }, [selectedRestaurantId, tablePage]);

    return (
        <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
            <button
                type="button"
                onClick={() => setIsTableExpanded((prev) => !prev)}
                className="flex w-full cursor-pointer flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-slate-800">
                            Table Overview
                        </h2>

                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            {tables.length} Tables
                        </span>
                    </div>

                    <p className="text-sm text-slate-500">
                        Monitor your restaurant's table availability.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                    {/* Status Legend */}
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
                        {TableStatuses.map((status) => (
                            <span
                                key={status}
                                className="flex items-center gap-1.5 text-slate-600"
                            >
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${tableStatusStyles[status]}`}
                                />
                                {status}
                            </span>
                        ))}
                    </div>

                    <ChevronDown
                        className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                            isTableExpanded ? "rotate-180" : ""
                        }`}
                    />
                </div>
            </button>

            {/* Collapsible Content */}
            {isTableExpanded && (
                <div className="mt-2 border-t border-slate-100 pt-6">
                    {!tableLoad ? (
                        <TableLoader />
                    ) : tables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                                <Armchair
                                    aria-hidden="true"
                                    className="h-7 w-7"
                                />
                            </div>

                            <h3 className="mt-2 text-base font-semibold text-slate-800">
                                No tables added yet
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                Add your first restaurant table to start
                                monitoring table availability and dining
                                sessions.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/table/create")}
                                className="mt-2 cursor-pointer self-start rounded-xl bg-[#6495ED] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md sm:self-auto"
                            >
                                + Add Your First Table
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {tables.map((table) => {
                                const status: TableStatus = !table.is_active
                                    ? "inactive"
                                    : table.dining_sessions.length === 0
                                      ? "available"
                                      : "occupied";

                                return (
                                    <div
                                        key={table.id}
                                        className={`rounded-xl border p-4 transition hover:shadow-sm ${tableStatusStylesCard[status]}`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-bold">
                                                    {table.table_name}
                                                </p>

                                                <p className="mt-1 text-xs opacity-75">
                                                    Capacity: {table.capacity} guests
                                                </p>
                                            </div>

                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-current" />
                                        </div>

                                        <div className="mt-5 border-t border-current/10 pt-3">
                                            <p className="text-xs font-semibold capitalize">
                                                {status}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
