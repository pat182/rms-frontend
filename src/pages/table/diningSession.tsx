import { useEffect, useRef, useState } from "react";
import { AlertCircle, Armchair, Check, ChevronDown, LoaderCircle, X } from "lucide-react";
import { getDiningSession, updateDiningSessionStatus } from "../../api/restaurantTable.ts";
import { getApiErrorMessage } from "../../api/utils.ts";
import type { DiningSession } from "../../types/restaurant.ts";
import type { HeaderNotification } from "../../types/global.ts";
import { useToast } from "../../components/globals/toastContext.tsx";
import { useRestaurant } from "../../components/globals/restaurantContext";

const DINING_SESSION_PAGE_SIZE = 8;

export default function DiningSession() {
    const { selectedRestaurantId } = useRestaurant();
    const [sessions, setSessions] = useState<DiningSession[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState("");
    const [loadMoreRetry, setLoadMoreRetry] = useState(0);
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "pending" | "verified" | "closed">("all");
    const [createdFrom, setCreatedFrom] = useState("");
    const [createdTo, setCreatedTo] = useState("");
    const [draftFilter, setDraftFilter] = useState<"all" | "active" | "pending" | "verified" | "closed">("all");
    const [draftCreatedFrom, setDraftCreatedFrom] = useState("");
    const [draftCreatedTo, setDraftCreatedTo] = useState("");
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingSessionId, setUpdatingSessionId] = useState<number | null>(null);
    const { showToast } = useToast();
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const loadingMoreRef = useRef(false);
    const filters = [
        { label: "All sessions", value: "all", count: sessions.length },
        { label: "Active", value: "active", count: sessions.filter((session) => session.is_active).length },
        { label: "Pending", value: "pending", count: sessions.filter((session) => session.status === "pending").length },
        { label: "Verified", value: "verified", count: sessions.filter((session) => session.status === "verified").length },
        { label: "Closed", value: "closed", count: sessions.filter((session) => session.status === "closed").length },
    ] as const;
    const invalidDraftDateRange = Boolean(
        draftCreatedFrom && draftCreatedTo && draftCreatedFrom > draftCreatedTo
    );
    
    const applyFilters = () => {
        if (invalidDraftDateRange) return;
        loadingMoreRef.current = false;
        setPage(1);
        setActiveFilter(draftFilter);
        setCreatedFrom(draftCreatedFrom);
        setCreatedTo(draftCreatedTo);
    };

    const clearFilters = () => {
        loadingMoreRef.current = false;
        setPage(1);
        setDraftFilter("all");
        setDraftCreatedFrom("");
        setDraftCreatedTo("");
        setActiveFilter("all");
        setCreatedFrom("");
        setCreatedTo("");
    };

    const handleSessionStatus = async (
        session: DiningSession,
        status: "verified" | "closed"
    ) => {
        setUpdatingSessionId(session.id);

        try {
            const response = await updateDiningSessionStatus(session.session_token, status);
            if (!response.ok) {
                throw new Error(await getApiErrorMessage(response));
            }

            setSessions((currentSessions) =>
                currentSessions.map((currentSession) =>
                    currentSession.id === session.id
                        ? {
                              ...currentSession,
                              status,
                              ...(status === "closed"
                                  ? { is_active: false, closed_at: new Date().toISOString() }
                                  : {}),
                          }
                        : currentSession
                )
            );
            window.dispatchEvent(
                new CustomEvent("dining-session-status-updated", {
                    detail: { session_id: session.id, status },
                }),
            );
            showToast(
            status === "verified"
                ? "Dining session accepted."
                : session.status === "pending"
                  ? "Dining session rejected."
                  : "Dining session closed.",
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

    const retryLoadingMore = () => {
        loadingMoreRef.current = true;
        setLoadMoreRetry((retry) => retry + 1);
    };

    useEffect(() => {
        let cancelled = false;

        async function fetchSessions() {
            const isFirstPage = page === 1;
            try {
                if (isFirstPage) {
                    setLoading(true);
                    setLoadingMore(false);
                    loadingMoreRef.current = false;
                    setError("");
                    setLoadMoreError("");
                } else {
                    setLoadingMore(true);
                    setLoadMoreError("");
                }

                const response = await getDiningSession({
                    page,
                    page_size: DINING_SESSION_PAGE_SIZE,
                    is_active: activeFilter === "active" ? true : undefined,
                    status:
                        activeFilter !== "all" && activeFilter !== "active"
                            ? activeFilter
                            : undefined,
                    started_from: createdFrom || undefined,
                    started_to:
                        createdTo && createdFrom === createdTo
                            ? `${createdTo}T23:59:59`
                            : createdTo || undefined,
                });
                if (!response.ok) {
                    throw new Error(await getApiErrorMessage(response));
                }

                const result: { data?: DiningSession[]; total_items?: number } = await response.json();
                if (!Array.isArray(result.data)) {
                    throw new Error("The dining sessions response was invalid.");
                }
                const pageSessions = result.data;

                // if (page > 1) {
                //     await new Promise((resolve) => window.setTimeout(resolve, 1000));
                // }

                if (!cancelled) {
                    const serverTotal =
                        typeof result.total_items === "number"
                            ? result.total_items
                            : (page - 1) * DINING_SESSION_PAGE_SIZE + pageSessions.length;
                    setTotalItems(serverTotal);
                    setHasMore(
                        pageSessions.length > 0 &&
                            page * DINING_SESSION_PAGE_SIZE < serverTotal
                    );
                    setSessions((currentSessions) => {
                        if (isFirstPage) return pageSessions;

                        const existingIds = new Set(currentSessions.map((session) => session.id));
                        return [
                            ...currentSessions,
                            ...pageSessions.filter((session) => !existingIds.has(session.id)),
                        ];
                    });
                }
            } catch (fetchError) {
                if (!cancelled) {
                    const message = fetchError instanceof Error
                        ? fetchError.message
                        : "Unable to load dining sessions.";
                    if (isFirstPage) setError(message);
                    else setLoadMoreError(message);
                }
            } finally {
                if (!cancelled) {
                    if (isFirstPage) setLoading(false);
                    else {
                        setLoadingMore(false);
                        loadingMoreRef.current = false;
                    }
                }
            }
        }

        void fetchSessions();
        return () => {
            cancelled = true;
        };
    }, [selectedRestaurantId,activeFilter, createdFrom, createdTo, page, loadMoreRetry]);

    useEffect(() => {
        const sentinel = loadMoreRef.current;
        if (!sentinel || !hasMore || loading || loadingMore || loadMoreError) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || loadingMoreRef.current) return;
                loadingMoreRef.current = true;
                setPage((currentPage) => currentPage + 1);
            },
            { rootMargin: "200px" },
        );
        observer.observe(sentinel);

        return () => observer.disconnect();
    }, [hasMore, loading, loadingMore, loadMoreError, sessions.length]);

    

    useEffect(() => {
        const handleDiningSessionCreated = (event: Event) => {
            const data = (event as CustomEvent<HeaderNotification["content"]>).detail;
            if (
                !data ||
                typeof data.session_id !== "number" ||
                typeof data.session_token !== "string" ||
                typeof data.table_name !== "string" ||
                typeof data.is_active !== "boolean" ||
                typeof data.started_at !== "string" ||
                (data.closed_at !== null && typeof data.closed_at !== "string") ||
                !["pending", "verified", "closed"].includes(data.status)
            ) {
                return;
            }

            const session: DiningSession = {
                id: data.session_id,
                session_token: data.session_token,
                is_active: data.is_active,
                status: data.status,
                started_at: data.started_at,
                closed_at: data.closed_at,
                restaurant_table: { table_name: data.table_name },
            };
            const matchesStatus =
                activeFilter === "all" ||
                (activeFilter === "active"
                    ? session.is_active
                    : session.status === activeFilter);
            const startedAt = new Date(session.started_at);
            const sessionDate = Number.isNaN(startedAt.getTime())
                ? ""
                : startedAt.toISOString().slice(0, 10);
            const matchesDate =
                (!createdFrom || sessionDate >= createdFrom) &&
                (!createdTo || sessionDate <= createdTo);

            if (!matchesStatus || !matchesDate) return;

            setSessions((currentSessions) => [
                session,
                ...currentSessions.filter((currentSession) => currentSession.id !== session.id),
            ]);
        };

        const handleDiningSessionStatusUpdated = (event: Event) => {
            const { session_id, status } = (
                event as CustomEvent<{
                    session_id: number;
                    status: DiningSession["status"];
                }>
            ).detail;

            if (typeof session_id !== "number" || !["pending", "verified", "closed"].includes(status)) {
                return;
            }

            const closedAt = status === "closed" ? new Date().toISOString() : null;
            setSessions((currentSessions) =>
                currentSessions.flatMap((session) => {
                    if (session.id !== session_id) return [session];

                    const updatedSession: DiningSession = {
                        ...session,
                        status,
                        ...(status === "closed"
                            ? { is_active: false, closed_at: closedAt }
                            : {}),
                    };
                    const matchesStatus =
                        activeFilter === "all" ||
                        (activeFilter === "active"
                            ? updatedSession.is_active
                            : updatedSession.status === activeFilter);

                    return matchesStatus ? [updatedSession] : [];
                }),
            );
        };

        window.addEventListener("dining-session-created", handleDiningSessionCreated);
        window.addEventListener("dining-session-status-updated", handleDiningSessionStatusUpdated);
        return () => {
            window.removeEventListener("dining-session-created", handleDiningSessionCreated);
            window.removeEventListener("dining-session-status-updated", handleDiningSessionStatusUpdated);
        };
    }, [activeFilter, createdFrom, createdTo]);

    return (
        <main className="space-y-7 p-5 sm:p-7">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4B70B8] via-[#5683D1] to-[#6495ED] px-6 py-7 text-white shadow-xl shadow-[#6495ED]/20 sm:px-8 sm:py-9">
                <div aria-hidden="true" className="absolute -right-12 -top-24 h-64 w-64 rounded-full border-[32px] border-white/5" />
                <div aria-hidden="true" className="absolute -bottom-28 right-36 h-56 w-56 rounded-full bg-cyan-300/10 blur-2xl" />
                <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                            FLOOR OVERVIEW
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            Dining Sessions
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-blue-100/80">
                            Keep track of guests, table activity, and session requests.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {[
                            { label: "Total", value: totalItems },
                            { label: "Active", value: sessions.filter((session) => session.is_active).length },
                            { label: "Pending", value: sessions.filter((session) => session.status === "pending").length },
                        ].map((stat) => (
                            <div key={stat.label} className="min-w-20 rounded-2xl border border-white/10 bg-white/10 px-3 py-3 backdrop-blur-sm sm:min-w-24 sm:px-4">
                                <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                                <p className="mt-0.5 text-xs text-blue-100/75">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section aria-label="Filter dining sessions" className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-slate-700">Filter sessions</h2>
                    <button
                        type="button"
                        aria-expanded={filtersExpanded}
                        aria-controls="dining-session-filters"
                        onClick={() => setFiltersExpanded((expanded) => !expanded)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-[#6495ED]"
                    >
                        {filtersExpanded ? "Hide filters" : "Show filters"}
                        <ChevronDown
                            aria-hidden="true"
                            className={`h-4 w-4 transition-transform ${filtersExpanded ? "rotate-180" : ""}`}
                        />
                    </button>
                </div>
                {filtersExpanded && (
                    <div id="dining-session-filters" className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4">
                        <div className="flex flex-wrap gap-2">
                            {filters.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    aria-pressed={draftFilter === filter.value}
                                    onClick={() => setDraftFilter(filter.value)}
                                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                                        draftFilter === filter.value
                                            ? "bg-[#6495ED] text-white shadow-sm shadow-[#6495ED]/25"
                                            : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50 hover:text-[#6495ED]"
                                    }`}
                                >
                                    {filter.label}
                                    <span className={`rounded-full px-1.5 py-0.5 text-xs ${
                                        draftFilter === filter.value
                                            ? "bg-white/15 text-white"
                                            : "bg-white text-slate-500"
                                    }`}>
                                        {filter.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-end">
                            <p className="pb-2 text-sm font-medium text-slate-600">Started between</p>
                            <div className="grid flex-1 grid-cols-1 gap-3 sm:max-w-lg sm:grid-cols-2">
                                <div>
                                    <label htmlFor="started-from" className="mb-1 block text-xs font-medium text-slate-500">From</label>
                                    <input
                                        id="started-from"
                                        type="date"
                                        value={draftCreatedFrom}
                                        max={draftCreatedTo || undefined}
                                        onChange={(event) => setDraftCreatedFrom(event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="started-to" className="mb-1 block text-xs font-medium text-slate-500">To</label>
                                    <input
                                        id="started-to"
                                        type="date"
                                        value={draftCreatedTo}
                                        min={draftCreatedFrom || undefined}
                                        onChange={(event) => setDraftCreatedTo(event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                    />
                                </div>
                            </div>
                            {invalidDraftDateRange && (
                                <p role="alert" className="pb-2 text-sm text-rose-600">The start date must be on or before the end date.</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                            >
                                Clear
                            </button>
                            <button
                                type="button"
                                onClick={applyFilters}
                                disabled={invalidDraftDateRange}
                                className="cursor-pointer rounded-xl bg-[#6495ED] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#6495ED]/25 transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Apply filters
                            </button>
                        </div>
                    </div>
                )}
            </section>

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
                    <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
                            <Armchair aria-hidden="true" className="h-7 w-7" />
                        </div>
                        <h2 className="mt-4 font-semibold text-slate-700">
                            {activeFilter !== "all" || createdFrom || createdTo
                                ? "No matching sessions"
                                : "No dining sessions yet"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            {activeFilter !== "all" || createdFrom || createdTo
                                ? "Try another filter to see more sessions."
                                : "Sessions will appear here when guests are seated."}
                        </p>
                    </div>
                ) : (
                    sessions.map((session) => {
                        return (
                            <article
                                key={session.id}
                                className="group relative flex min-h-56 flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
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
                                                onClick={() => void handleSessionStatus(session, "verified")}
                                                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-900/10 transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
                                            >
                                                <Check aria-hidden="true" size={16} />
                                                Accept
                                            </button>
                                            <button
                                                type="button"
                                                disabled={updatingSessionId !== null}
                                                onClick={() => void handleSessionStatus(session, "closed")}
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
                                            onClick={() => void handleSessionStatus(session, "closed")}
                                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60"
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
            {hasMore && (
                <div ref={loadMoreRef} className="flex min-h-12 items-center justify-center">
                    {loadingMore && (
                        <div role="status" className="flex items-center gap-2 text-sm text-slate-500">
                            <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin text-[#6495ED]" />
                            <span>Loading more sessions...</span>
                        </div>
                    )}
                    {loadMoreError && (
                        <div className="flex items-center gap-3 text-sm">
                            <p role="alert" className="text-rose-700">{loadMoreError}</p>
                            <button
                                type="button"
                                onClick={retryLoadingMore}
                                className="cursor-pointer rounded-lg bg-[#6495ED] px-3 py-1.5 font-semibold text-white transition hover:bg-blue-600"
                            >
                                Retry
                            </button>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}