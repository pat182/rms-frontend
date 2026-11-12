import { useState } from "react";
import { DiningSession, DiningSessionCardProps } from "../../types/restaurant";
import { Armchair, Check, ClipboardList, X } from "lucide-react";
import OrdersModal from "../customerOrders/ordersModal.tsx";


export default function DiningSessionCard({
    sessions,
    onUpdateStatus,
    updatingSessionId,
}: DiningSessionCardProps){
    const [selectedSession, setSelectedSession] = useState<DiningSession | null>(null);

    return (
        <>
            {sessions.map((session: DiningSession) => (
                <article
                    key={session.id}
                    className="group relative flex min-h-56 flex-col overflow-hidden rounded-3xl border 
                    border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 
                    hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300" />

                    <div className="flex w-full items-start justify-between gap-3 pt-1">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="shrink-0 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-3 text-blue-600 ring-1 ring-blue-100 transition duration-200 group-hover:scale-105">
                                <Armchair aria-hidden="true" className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                                    Session #{session.id}
                                </p>
                                <h2 className="mt-1 truncate text-lg font-semibold tracking-tight text-slate-800">
                                    {session.restaurant_table.table_name}
                                </h2>
                            </div>
                        </div>
                        <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                session.is_active
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                            }`}
                        >
                            {session.is_active ? "Active" : "Ended"}
                        </span>
                    </div>
                    <div className="mt-5 w-full space-y-3 rounded-2xl bg-slate-50/80 p-4 text-sm ring-1 ring-slate-100">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-500">Status</span>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                                session.status === "verified"
                                    ? "bg-blue-100 text-blue-700"
                                    : session.status === "pending"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-rose-100 text-rose-700"
                            }`}>
                                {session.status}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-slate-200/70 pt-3">
                            <span className="text-slate-500">Started</span>
                            <span className="text-right font-medium text-slate-700">
                                {new Date(session.started_at).toLocaleTimeString()}
                            </span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-500">Date</span>
                            <span className="text-right font-medium text-slate-700">
                                {new Date(session.started_at).toLocaleDateString()}
                            </span>
                        </div>
                        {session.closed_at && (
                            <>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Ended</span>
                                    <span className="text-right font-medium text-slate-700">
                                        {new Date(session.closed_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">End date</span>
                                    <span className="text-right font-medium text-slate-700">
                                        {new Date(session.closed_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </>
                        )}
                        {session.status === "pending" && (
                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    disabled={updatingSessionId !== null}
                                    onClick={() => void onUpdateStatus(session, "verified")}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                                >
                                    <Check aria-hidden="true" size={16} />
                                    Accept
                                </button>
                                <button
                                    type="button"
                                    disabled={updatingSessionId !== null}
                                    onClick={() => void onUpdateStatus(session, "closed")}
                                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
                                >
                                    <X aria-hidden="true" size={16} />
                                    Reject
                                </button>
                            </div>
                        )}
                        {session.status === "verified" && !session.closed_at && (
                            <button
                                type="button"
                                disabled={updatingSessionId !== null}
                                onClick={() => void onUpdateStatus(session, "closed")}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
                            >
                                <X aria-hidden="true" size={16} />
                                Close
                            </button>
                        )}
                        {(session.status === "verified" || session.status === "closed") && (
                            <button
                                type="button"
                                onClick={() => setSelectedSession(session)}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#6495ED] px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#6495ED]/25 transition hover:bg-blue-600"
                            >
                                <ClipboardList aria-hidden="true" size={16} />
                                View Orders
                            </button>
                        )}
                    </div>

                </article>
            ))}
            {selectedSession && (
            <OrdersModal
                session={selectedSession}
                onClose={() => setSelectedSession(null)}
            />
            )}
        </>
    );
}