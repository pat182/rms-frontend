


import { useEffect, useState } from "react";
import { AlertCircle, Armchair, Check, X } from "lucide-react";
import { getDiningSession, updateRestaurantTableStatus } from "../../api/restaurantTable.ts";
import { getApiErrorMessage } from "../../api/utils.ts";
import type { DiningSession } from "../../types/restaurant.ts";
import { useToast } from "../../components/globals/toastContext.tsx";


export default function Table() {
    const [sessions, setSessions] = useState<DiningSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingSessionId, setUpdatingSessionId] = useState<number | null>(null);
    const { showToast } = useToast();

    const handleSessionStatus = async (
        session: DiningSession,
        status: "verified" | "rejected"
    ) => {
        setUpdatingSessionId(session.id);

        try {
            const response = await updateRestaurantTableStatus(session.session_token, status);
            if (!response.ok) {
                throw new Error(await getApiErrorMessage(response));
            }

            setSessions((currentSessions) =>
                currentSessions.map((currentSession) =>
                    currentSession.id === session.id
                        ? { ...currentSession, status }
                        : currentSession
                )
            );
            showToast(
                `Dining session ${status === "verified" ? "accepted" : "rejected"}.`,
                "success"
            );
        } catch (statusError) {
            showToast(
                statusError instanceof Error
                    ? statusError.message
                    : "Unable to update the dining session.",
                "error"
            );
        } finally {
            setUpdatingSessionId(null);
        }
    };

    useEffect(() => {
        let cancelled = false;

        async function fetchSessions() {
            try {
                setLoading(true);
                setError("");

                const response = await getDiningSession();
                if (!response.ok) {
                    throw new Error(await getApiErrorMessage(response));
                }

                const result: { data?: DiningSession[] } = await response.json();
                if (!Array.isArray(result.data)) {
                    throw new Error("The dining sessions response was invalid.");
                }

                if (!cancelled) {
                    setSessions(result.data);
                }
            } catch (fetchError) {
                if (!cancelled) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Unable to load dining sessions."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchSessions();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="p-6">
            <div className="mb-8 flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        Dining Sessions
                    </h1>

                    <p className="max-w-xl text-sm leading-6 text-slate-500">
                        View current dining sessions, their status, and the tables in use.
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
                            <h2 className="font-semibold">Unable to load dining sessions</h2>
                            <p className="mt-1 text-sm text-rose-700">{error}</p>
                        </div>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="col-span-full rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">
                        No dining sessions found.
                    </div>
                ) : (
                    sessions.map((session) => {
                        return (
                            <article
                                key={session.id}
                                className="group relative flex min-h-56 flex-col items-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                            >
                                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6495ED] via-blue-300 to-cyan-300" />

                                <span
                                    className={`absolute right-4 top-5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        session.is_active
                                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                            : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                                    }`}
                                >
                                    {session.is_active ? "Active" : "Ended"}
                                </span>

                                <div className="mb-4 flex justify-center pt-2">
                                    <div className="rounded-2xl bg-blue-50 p-3 transition duration-200 group-hover:scale-105 group-hover:bg-blue-100">
                                        <Armchair aria-hidden="true" className="h-7 w-7 text-[#6495ED]" />
                                    </div>
                                </div>

                                <h2 className="mb-4 text-center text-lg font-semibold tracking-tight text-slate-700">
                                    Dining Session #{session.id}
                                </h2>
                                <div className="mt-auto w-full space-y-3 border-t border-slate-100 pt-4 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-400">Table</span>
                                        <span className="font-medium text-slate-600">
                                            {session.restaurant_table.table_name}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-400">Status</span>
                                        <span className="font-medium capitalize text-slate-600">
                                            {session.status}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-slate-400">Started</span>
                                        <span className="text-right font-medium text-slate-600">
                                            {new Date(session.started_at).toLocaleString()}
                                        </span>
                                    </div>
                                    {session.closed_at && (
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-400">Ended</span>
                                            <span className="text-right font-medium text-slate-600">
                                                {new Date(session.closed_at).toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                    {session.status === "pending" && (
                                        <div className="flex gap-2 pt-1">
                                            <button
                                                type="button"
                                                disabled={updatingSessionId !== null}
                                                onClick={() => void handleSessionStatus(session, "verified")}
                                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
                                            >
                                                <Check aria-hidden="true" size={16} />
                                                Accept
                                            </button>
                                            <button
                                                type="button"
                                                disabled={updatingSessionId !== null}
                                                onClick={() => void handleSessionStatus(session, "rejected")}
                                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-wait disabled:opacity-60"
                                            >
                                                <X aria-hidden="true" size={16} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {session.status === "verified" && (
                                        <button
                                            type="button"
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                                        >
                                            <X aria-hidden="true" size={16} />
                                            Close
                                        </button>
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