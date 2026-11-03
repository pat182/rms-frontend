


import { useEffect, useState } from "react";
import { AlertCircle, Armchair } from "lucide-react";
import { getDiningSession } from "../../api/restaurantTable.ts";
import { getApiErrorMessage } from "../../api/utils.ts";
import type { RestaurantTable } from "../../types/restaurant.ts";


export default function Table() {
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchTables() {
            try {
                setLoading(true);
                setError("");

                const response = await getDiningSession();
                if (!response.ok) {
                    throw new Error(await getApiErrorMessage(response));
                }

                const result: { data?: RestaurantTable[] } = await response.json();
                if (!Array.isArray(result.data)) {
                    throw new Error("The restaurant tables response was invalid.");
                }

                if (!cancelled) {
                    setTables(result.data);
                }
            } catch (fetchError) {
                if (!cancelled) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Unable to load restaurant tables."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchTables();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="p-6">
            <div className="mb-8 flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        Restaurant Tables
                    </h1>

                    <p className="max-w-xl text-sm leading-6 text-slate-500">
                        Manage/check your restaurant tables and their statuses.
                    </p>
                </div>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }, (_, index) => (
                        <div
                            key={index}
                            aria-hidden="true"
                            className="relative min-h-56 animate-pulse overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                        >
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-100 via-blue-200 to-cyan-100" />
                            <div className="mx-auto mt-3 h-12 w-12 rounded-2xl bg-blue-50" />
                            <div className="mx-auto mt-5 h-5 w-2/3 rounded-full bg-slate-100" />
                            <div className="mx-auto mt-4 h-6 w-24 rounded-full bg-slate-100" />
                        </div>
                    ))
                ) : error ? (
                    <div
                        role="alert"
                        className="col-span-full flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 shadow-sm"
                    >
                        <div className="rounded-xl bg-white p-2 text-rose-600 shadow-sm">
                            <AlertCircle aria-hidden="true" className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="font-semibold">Unable to load tables</h2>
                            <p className="mt-1 text-sm text-rose-700">{error}</p>
                        </div>
                    </div>
                ) : tables.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
                        No restaurant tables found.
                    </div>
                ) : (
                    tables.map((table, index) => {
                        const tableName = table.table_name || `Table ${table.id ?? index + 1}`;
                        const activeSession = table.dining_sessions.find(
                            (session) => session.is_active
                        );

                        return (
                            <article
                                key={table.id ?? `${tableName}-${index}`}
                                className="group relative flex min-h-56 flex-col items-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6495ED] via-blue-300 to-cyan-300" />

                                <span
                                    className={`absolute right-4 top-5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        table.is_active
                                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                            : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                                    }`}
                                >
                                    {table.is_active ? "Active" : "Inactive"}
                                </span>

                                <div className="mb-4 flex justify-center pt-2">
                                    <div className="rounded-2xl bg-blue-50 p-3 transition duration-200 group-hover:scale-105 group-hover:bg-blue-100">
                                        <Armchair aria-hidden="true" className="h-7 w-7 text-[#6495ED]" />
                                    </div>
                                </div>

                                <h2 className="mb-4 text-center text-lg font-semibold tracking-tight text-slate-700">
                                    {tableName}
                                </h2>
                                <div className="mt-auto w-full space-y-3 border-t border-slate-100 pt-4 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-400">Capacity</span>
                                        <span className="font-medium text-slate-600">{table.capacity}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-400">Dining session</span>
                                        <span
                                            className={`font-medium ${
                                                activeSession ? "text-amber-700" : "text-slate-500"
                                            }`}
                                        >
                                            {activeSession ? "In use" : "Available"}
                                        </span>
                                    </div>
                                    {activeSession && (
                                        <>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Session</span>
                                                <span className="font-medium text-slate-600">
                                                    #{activeSession.id}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Status</span>
                                                <span className="font-medium capitalize text-slate-600">
                                                    {activeSession.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <span className="text-slate-400">Started</span>
                                                <span className="text-right font-medium text-slate-600">
                                                    {new Date(activeSession.started_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </article>
                        );
                    })
                )}
            </div>
        </main>
    );
}