
import { useEffect, useState } from "react";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import {
    CalendarDays,
    ChevronDown,
    Clock3,
    TrendingUp,
    ShoppingBag,
    CheckCircle2,
    XCircle,
    Utensils,
    Activity,
} from "lucide-react";

import type {
    OrderChartItem,
    OrderDateFilter,
    OrderInsights,
} from "../types/dashboard";

import type { OrderWithSession } from "../types/order";

import TableOverview from "../components/dashboard/tablesComponent";
import RecentOrders from "../components/dashboard/ordersComponent";
import { TableLoader } from "../components/globals/tableLoader";

import { getChartOrders } from "../api/dashboard";
import { getApiErrorMessage } from "../api/utils";

import { useRestaurant } from "../components/globals/restaurantContext";
import { useOrderDateRange } from "../hooks/dashboard/useOrderDateRange";
import { useOrderCreated } from "../hooks/dashboard/useOrderCreateEvenHandler";
import { useOrderUpdated } from "../hooks/dashboard/useOrderUpdateEventHandler";

const EMPTY_ORDER_INSIGHTS: OrderInsights = {
    revenue: 0,
    average_order_value: 0,
    completed: 0,
    canceled: 0,
    pending: 0,
    preparing: 0,
};

const formatCurrency = (value: number) =>
    value.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

export default function Dashboard() {
    const { selectedRestaurantId } = useRestaurant();

    const [totalOrders, setTotalOrders] = useState(0);
    const [chartData, setChartData] = useState<OrderChartItem[]>([]);
    const [orderInsights, setOrderInsights] =
        useState<OrderInsights>(EMPTY_ORDER_INSIGHTS);

    const [isChartLoading, setIsChartLoading] = useState(false);
    const [chartError, setChartError] = useState("");

    const [orderDateFilter, setOrderDateFilter] =
        useState<OrderDateFilter>("today");

    const [orderDateFrom, setOrderDateFrom] = useState("");
    const [orderDateTo, setOrderDateTo] = useState("");

    const [isOrderActivityOpen, setIsOrderActivityOpen] = useState(true);

    const [newOrder, setNewOrder] = useState<OrderWithSession | null>(null);
    const [recentOrders, setRecentOrders] = useState<OrderWithSession[]>([]);

    const dateRange = useOrderDateRange(
        orderDateFilter,
        orderDateFrom,
        orderDateTo,
    );

    // Fetch Order Activity chart data and insights.
    useEffect(() => {
        let cancelled = false;

        const fetchChartData = async () => {
            if (!dateRange) {
                setChartData([]);
                setTotalOrders(0);
                setOrderInsights(EMPTY_ORDER_INSIGHTS);
                setChartError("");
                setIsChartLoading(false);
                return;
            }

            setIsChartLoading(true);
            setChartError("");

            try {
                const response = await getChartOrders(dateRange);

                if (!response.ok) {
                    throw new Error(await getApiErrorMessage(response));
                }

                const result = await response.json();

                if (cancelled) return;

                const formattedChartData: OrderChartItem[] = Array.from(
                    { length: 24 },
                    (_, hour) => ({
                        hour,
                        time: new Date(
                            2000,
                            0,
                            1,
                            hour,
                        ).toLocaleTimeString([], {
                            hour: "numeric",
                            hour12: true,
                        }),
                        orders: 0,
                    }),
                );

                (result.data?.chart ?? []).forEach(
                    (item: OrderChartItem) => {
                        const localHour = new Date(
                            Date.UTC(2000, 0, 1, item.hour),
                        ).getHours();

                        formattedChartData[localHour].orders += item.orders;
                    },
                );

                setChartData(formattedChartData);
                setTotalOrders(result.data?.total_orders ?? 0);

                setOrderInsights({
                    revenue: result.data?.insights?.revenue ?? 0,
                    average_order_value:
                        result.data?.insights?.average_order_value ?? 0,
                    completed: result.data?.insights?.completed ?? 0,
                    canceled: result.data?.insights?.canceled ?? 0,
                    pending: result.data?.insights?.pending ?? 0,
                    preparing: result.data?.insights?.preparing ?? 0,
                });
            } catch (error) {
                if (cancelled) return;

                console.error("Failed to fetch order chart:", error);

                setChartData([]);
                setTotalOrders(0);
                setOrderInsights(EMPTY_ORDER_INSIGHTS);

                setChartError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load order activity.",
                );
            } finally {
                if (!cancelled) {
                    setIsChartLoading(false);
                }
            }
        };

        fetchChartData();

        return () => {
            cancelled = true;
        };
    }, [selectedRestaurantId, dateRange]);

    useOrderCreated({
        dateRange,
        orderDateFilter,
        totalOrders,
        setNewOrder,
        setTotalOrders,
        setChartData,
        setOrderInsights,
    });

    useOrderUpdated({
        recentOrders,
        setRecentOrders,
        setOrderInsights,
        totalOrders,
    });

    return (
        <main className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-7">

                {/* Dashboard Header */}
                <header className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
                    <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-indigo-100/40 blur-3xl" />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                                <Activity size={14} />
                                Restaurant Overview
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Dashboard
                            </h1>

                            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                                Your restaurant operations, table availability,
                                and order performance at a glance.
                            </p>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 shadow-sm">
                            <Utensils size={23} />
                        </div>
                    </div>
                </header>

                {/* Table Overview */}
                <TableOverview />

                {/* Order Activity */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50">

                    {/* Order Activity Header */}
                    <button
                        type="button"
                        onClick={() =>
                            setIsOrderActivityOpen((prev) => !prev)
                        }
                        aria-expanded={isOrderActivityOpen}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition hover:bg-slate-50/70 sm:p-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <ShoppingBag size={21} />
                            </div>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold tracking-tight text-slate-800 sm:text-xl">
                                        Order Activity
                                    </h2>

                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Activity
                                    </span>
                                </div>

                                <p className="mt-0.5 text-sm text-slate-500">
                                    Track orders, revenue, and restaurant performance.
                                </p>
                            </div>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100">
                            <ChevronDown
                                className={`h-5 w-5 transition-transform duration-300 ${
                                    isOrderActivityOpen ? "rotate-180" : ""
                                }`}
                            />
                        </div>
                    </button>

                    {isOrderActivityOpen && (
                        <div className="space-y-6 border-t border-slate-100 p-4 sm:p-6">

                            {/* Orders Toolbar */}
                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">

                                {/* Total Orders */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                        <ShoppingBag size={22} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            Total Orders
                                        </p>

                                        <p className="mt-0.5 text-2xl font-bold tabular-nums text-slate-900">
                                            {isChartLoading ? "..." : totalOrders}
                                        </p>
                                    </div>
                                </div>

                                {/* Date Filter */}
                                <div className="flex flex-col gap-2 sm:w-auto sm:min-w-[220px] sm:max-w-md">
                                    <label className="text-xs font-semibold text-slate-500">
                                        Reporting period
                                    </label>

                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                            <CalendarDays className="h-4 w-4 text-blue-500" />
                                        </div>

                                        <select
                                            value={orderDateFilter}
                                            onChange={(e) =>
                                                setOrderDateFilter(
                                                    e.target.value as OrderDateFilter,
                                                )
                                            }
                                            className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="today">Today</option>
                                            <option value="week">This Week</option>
                                            <option value="month">This Month</option>
                                            <option value="custom">Custom Range</option>
                                        </select>

                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>

                                    {orderDateFilter === "custom" && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                type="date"
                                                value={orderDateFrom}
                                                max={orderDateTo || undefined}
                                                onChange={(e) =>
                                                    setOrderDateFrom(e.target.value)
                                                }
                                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />

                                            <span className="text-xs font-medium text-slate-400">
                                                to
                                            </span>

                                            <input
                                                type="date"
                                                value={orderDateTo}
                                                min={orderDateFrom || undefined}
                                                onChange={(e) =>
                                                    setOrderDateTo(e.target.value)
                                                }
                                                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Dashboard Grid */}
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                                {/* Order Insights */}
                                <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 xl:col-span-2">
                                    <div className="mb-5 flex items-center justify-between gap-3">
                                        <div>
                                            <h3 className="text-base font-bold text-slate-800">
                                                Order Insights
                                            </h3>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Performance for the selected period
                                            </p>
                                        </div>

                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                            <TrendingUp size={19} />
                                        </div>
                                    </div>

                                    {isChartLoading ? (
                                        <div className="flex min-h-[340px] items-center justify-center">
                                            <TableLoader />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">

                                            {/* Revenue */}
                                            {/* Revenue */}
                                            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-500">
                                                            Total Revenue
                                                        </p>

                                                        <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-3xl">
                                                            ₱{formatCurrency(orderInsights.revenue)}
                                                        </p>

                                                        <p className="mt-2 text-xs text-slate-400">
                                                            Revenue generated during this period
                                                        </p>
                                                    </div>

                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600">
                                                        <TrendingUp size={20} />
                                                    </div>
                                                </div>

                                                <div className="mt-5 border-t border-slate-100 pt-3">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
                                                        <Activity size={14} />
                                                        <span>Revenue overview</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Average Order Value */}
                                            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                            Average Order Value
                                                        </p>

                                                        <p className="mt-2 text-xl font-bold tabular-nums text-slate-800">
                                                            ₱{formatCurrency(orderInsights.average_order_value)}
                                                        </p>
                                                    </div>

                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                                                        <ShoppingBag size={19} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Status Metrics */}
                                            <div className="grid grid-cols-2 gap-3">

                                                {/* Completed */}
                                                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 transition hover:border-emerald-200">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-semibold text-emerald-700">
                                                            Completed
                                                        </p>

                                                        <CheckCircle2
                                                            size={18}
                                                            className="text-emerald-600"
                                                        />
                                                    </div>

                                                    <p className="mt-3 text-2xl font-bold tabular-nums text-emerald-800">
                                                        {orderInsights.completed}
                                                    </p>
                                                </div>

                                                {/* Preparing */}
                                                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 transition hover:border-blue-200">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-semibold text-blue-700">
                                                            Preparing
                                                        </p>

                                                        <Clock3
                                                            size={18}
                                                            className="text-blue-600"
                                                        />
                                                    </div>

                                                    <p className="mt-3 text-2xl font-bold tabular-nums text-blue-800">
                                                        {orderInsights.preparing}
                                                    </p>
                                                </div>

                                                {/* Pending */}
                                                <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 transition hover:border-amber-200">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-semibold text-amber-700">
                                                            Pending
                                                        </p>

                                                        <Clock3
                                                            size={18}
                                                            className="text-amber-600"
                                                        />
                                                    </div>

                                                    <p className="mt-3 text-2xl font-bold tabular-nums text-amber-800">
                                                        {orderInsights.pending}
                                                    </p>
                                                </div>

                                                {/* Canceled */}
                                                <div className="rounded-xl border border-red-100 bg-red-50/60 p-4 transition hover:border-red-200">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs font-semibold text-red-700">
                                                            Canceled
                                                        </p>

                                                        <XCircle
                                                            size={18}
                                                            className="text-red-500"
                                                        />
                                                    </div>

                                                    <p className="mt-3 text-2xl font-bold tabular-nums text-red-700">
                                                        {orderInsights.canceled}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Recent Orders */}
                                <div className="min-w-0">
                                    <RecentOrders
                                        orderDateFilter={orderDateFilter}
                                        orderDateFrom={orderDateFrom}
                                        orderDateTo={orderDateTo}
                                        newOrder={newOrder}
                                        recentOrders={recentOrders}
                                        setRecentOrders={setRecentOrders}
                                    />
                                </div>
                            </div>

                            {/* Order Chart */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                                <Activity size={19} />
                                            </div>

                                            <h3 className="text-base font-bold text-slate-800">
                                                Order Overview
                                            </h3>
                                        </div>

                                        <p className="mt-2 text-xs text-slate-500">
                                            Hourly order distribution for the selected period
                                        </p>
                                    </div>

                                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        Orders per hour
                                    </span>
                                </div>

                                <div className="p-4 sm:p-5">
                                    {chartError && (
                                        <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                                            {chartError}
                                        </p>
                                    )}

                                    <div className="relative h-80 w-full">
                                        {isChartLoading ? (
                                            <div className="flex h-full items-center justify-center">
                                                <TableLoader />
                                            </div>
                                        ) : chartError ? (
                                            <div className="flex h-full flex-col items-center justify-center text-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-500">
                                                    <Activity size={22} />
                                                </div>

                                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                                    Unable to load chart data
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Please try again later.
                                                </p>
                                            </div>
                                        ) : chartData.length === 0 ? (
                                            <div className="flex h-full flex-col items-center justify-center text-center">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                                    <ShoppingBag size={22} />
                                                </div>

                                                <p className="mt-3 text-sm font-semibold text-slate-700">
                                                    No order data available
                                                </p>

                                                <p className="mt-1 text-xs text-slate-400">
                                                    Orders will appear here when available.
                                                </p>
                                            </div>
                                        ) : (
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <BarChart
                                                    data={chartData}
                                                    margin={{
                                                        top: 10,
                                                        right: 10,
                                                        left: -20,
                                                        bottom: 5,
                                                    }}
                                                >
                                                    <CartesianGrid
                                                        strokeDasharray="3 3"
                                                        vertical={false}
                                                        stroke="#e2e8f0"
                                                    />

                                                    <XAxis
                                                        dataKey="time"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        interval={0}
                                                        tick={{
                                                            fill: "#94a3b8",
                                                            fontSize: 11,
                                                        }}
                                                        tickMargin={10}
                                                    />

                                                    <YAxis
                                                        allowDecimals={false}
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{
                                                            fill: "#94a3b8",
                                                            fontSize: 11,
                                                        }}
                                                    />

                                                    <Tooltip
                                                        cursor={{
                                                            fill: "#eff6ff",
                                                        }}
                                                        contentStyle={{
                                                            borderRadius: "12px",
                                                            border: "1px solid #e2e8f0",
                                                            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
                                                            fontSize: "13px",
                                                        }}
                                                        labelStyle={{
                                                            color: "#475569",
                                                            fontWeight: 600,
                                                            marginBottom: "4px",
                                                        }}
                                                    />

                                                    <Bar
                                                        dataKey="orders"
                                                        name="Orders"
                                                        fill="#6495ED"
                                                        radius={[6, 6, 0, 0]}
                                                        barSize={28}
                                                        activeBar={{
                                                            fill: "#3B82F6",
                                                        }}
                                                    />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
