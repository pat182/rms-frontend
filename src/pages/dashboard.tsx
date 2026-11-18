
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
    ChevronUp,
    Clock3,
} from "lucide-react";

import {
    OrderChartItem,
    OrderDateFilter,
    OrderInsights,
} from "../types/dashboard";

import TableOverview from "../components/dashboard/tablesComponent";
import RecentOrders from "../components/dashboard/ordersComponent";
import { TableLoader } from "../components/globals/tableLoader";

import { getChartOrders } from "../api/dashboard";
import { getApiErrorMessage } from "../api/utils";

import { useRestaurant } from "../components/globals/restaurantContext";
import { useOrderDateRange } from "../hooks/dashboard/useOrderDateRange";

const emptyOrderInsights: OrderInsights = {
    revenue: 0,
    average_order_value: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
    preparing: 0,
};

export default function Dashboard() {
    const { selectedRestaurantId } = useRestaurant();

    const [totalOrders, setTotalOrders] = useState(0);
    const [chartData, setChartData] = useState<OrderChartItem[]>([]);
    const [orderInsights, setOrderInsights] =
        useState<OrderInsights>(emptyOrderInsights);

    const [isChartLoading, setIsChartLoading] = useState(false);
    const [chartError, setChartError] = useState("");

    const [orderDateFilter, setOrderDateFilter] =
        useState<OrderDateFilter>("today");

    const [orderDateFrom, setOrderDateFrom] = useState("");
    const [orderDateTo, setOrderDateTo] = useState("");

    const [isOrderActivityOpen, setIsOrderActivityOpen] =
        useState(true);

    // Get date range based on the selected filter.
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
                setOrderInsights(emptyOrderInsights);
                setChartError("");
                setIsChartLoading(false);
                return;
            }

            setIsChartLoading(true);
            setChartError("");

            try {
                const response = await getChartOrders(dateRange);

                // Temporary delay for loader testing
                // await new Promise((resolve) =>
                //     setTimeout(resolve, 5000),
                // );

                if (!response.ok) {
                    throw new Error(
                        await getApiErrorMessage(response),
                    );
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
                    cancelled: result.data?.insights?.cancelled ?? 0,
                    pending: result.data?.insights?.pending ?? 0,
                    preparing: result.data?.insights?.preparing ?? 0,
                });

            } catch (error) {
                if (cancelled) return;

                console.error(
                    "Failed to fetch order chart:",
                    error,
                );

                setChartData([]);
                setTotalOrders(0);
                setOrderInsights(emptyOrderInsights);

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

    return (
        <main className="p-6">
            {/* Dashboard Header */}
            <div className="mb-8 flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        Dashboard
                    </h1>

                    <p className="max-w-xl text-sm leading-6 text-slate-500">
                        Monitor your restaurant's activity.
                    </p>
                </div>
            </div>

            {/* Table Overview */}
            <TableOverview />

            {/* Order Activity */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">

                {/* Collapsible Header */}
                <button
                    type="button"
                    onClick={() =>
                        setIsOrderActivityOpen((prev) => !prev)
                    }
                    aria-expanded={isOrderActivityOpen}
                    className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl p-5 text-left transition"
                >
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Order Activity
                        </h2>

                        <p className="text-sm text-slate-500">
                            Monitor your restaurant's orders and activity.
                        </p>
                    </div>

                    {isOrderActivityOpen ? (
                        <ChevronUp className="h-5 w-5 shrink-0 text-slate-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 shrink-0 text-slate-500" />
                    )}
                </button>

                {/* Collapsible Content */}
                {isOrderActivityOpen && (
                    <div className="border-t border-slate-100 p-5">

                        {/* Total Orders + Shared Date Filter */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                            {/* Total Orders - Far Left */}
                            <div className="inline-flex min-w-44 flex-col rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                                <p className="text-sm font-medium text-slate-500">
                                    Total Orders
                                </p>

                                <p className="mt-1 text-3xl font-bold tabular-nums text-[#6495ED]">
                                    {isChartLoading ? "..." : totalOrders}
                                </p>
                            </div>

                            {/* Date Filter - Far Right */}
                            <div className="flex flex-col gap-3 sm:w-auto sm:min-w-[220px] sm:max-w-md">
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                        <CalendarDays className="h-4 w-4 text-[#6495ED]" />
                                    </div>

                                    <select
                                        value={orderDateFilter}
                                        onChange={(e) =>
                                            setOrderDateFilter(
                                                e.target.value as OrderDateFilter,
                                            )
                                        }
                                        className="w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-[#6495ED] focus:ring-2 focus:ring-blue-100"
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

                                {/* Custom Date Range */}
                                {orderDateFilter === "custom" && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <input
                                            type="date"
                                            value={orderDateFrom}
                                            max={orderDateTo || undefined}
                                            onChange={(e) =>
                                                setOrderDateFrom(e.target.value)
                                            }
                                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-blue-100"
                                        />

                                        <span className="text-sm text-slate-400">
                                            to
                                        </span>

                                        <input
                                            type="date"
                                            value={orderDateTo}
                                            min={orderDateFrom || undefined}
                                            onChange={(e) =>
                                                setOrderDateTo(e.target.value)
                                            }
                                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Activity Content */}
                        <div className="space-y-6">

                            

                            {/* Recent Orders + Order Insights */}
                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                                {/* Order Insights */}
                                <section className="min-w-0 xl:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
                                    <div className="mb-5">
                                        <h3 className="text-lg font-bold text-slate-800">
                                            Order Insights
                                        </h3>

                                        <p className="text-sm text-slate-500">
                                            Summary for the selected period.
                                        </p>
                                    </div>

                                    {isChartLoading ? (
                                        <div className="flex min-h-[400px] items-center justify-center">
                                            <TableLoader />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">

                                            {/* Revenue */}
                                            <div className="rounded-xl bg-blue-50/60 p-4">
                                                <p className="text-sm font-medium text-slate-500">
                                                    Revenue
                                                </p>

                                                <p className="mt-1 text-2xl font-bold tabular-nums text-[#6495ED]">
                                                    {orderInsights.revenue.toLocaleString("en-PH", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </p>
                                            </div>

                                            {/* Average Order Value */}
                                            <div className="rounded-xl border border-slate-100 p-4">
                                                <p className="text-sm font-medium text-slate-500">
                                                    Average Order Value
                                                </p>

                                                <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
                                                    {orderInsights.average_order_value.toLocaleString("en-PH", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </p>
                                            </div>

                                            {/* Completed Orders */}
                                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">
                                                        Completed Orders
                                                    </p>

                                                    <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
                                                        {orderInsights.completed}
                                                    </p>
                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                                    <span className="text-lg font-bold">✓</span>
                                                </div>
                                            </div>

                                            {/* Preparing Orders */}
                                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">
                                                        Preparing Orders
                                                    </p>

                                                    <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
                                                        {orderInsights.preparing ?? 0}
                                                    </p>
                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                                    <Clock3 className="h-5 w-5" />
                                                </div>
                                            </div>

                                            {/* Pending Orders */}
                                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">
                                                        Pending Orders
                                                    </p>

                                                    <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
                                                        {orderInsights.pending ?? 0}
                                                    </p>
                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                                                    <Clock3 className="h-5 w-5" />
                                                </div>
                                            </div>

                                            {/* Cancelled Orders */}
                                            <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">
                                                        Cancelled Orders
                                                    </p>

                                                    <p className="mt-1 text-xl font-bold tabular-nums text-slate-800">
                                                        {orderInsights.cancelled}
                                                    </p>
                                                </div>

                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                                                    <span className="text-lg font-bold">×</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                <RecentOrders
                                    orderDateFilter={orderDateFilter}
                                    orderDateFrom={orderDateFrom}
                                    orderDateTo={orderDateTo}
                                />

                            </div>

                            {/* Order Overview - Full Width */}
                            <section className="w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">

                                {/* Chart Error */}
                                {chartError && (
                                    <p className="mb-4 text-sm text-red-500">
                                        {chartError}
                                    </p>
                                )}

                                {/* Order Chart */}
                                <div className="relative h-80 w-full">
                                    {isChartLoading ? (
                                        <div className="flex h-full items-center justify-center">
                                            <TableLoader />
                                        </div>
                                    ) : chartError ? (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="text-sm text-slate-400">
                                                Unable to load chart data.
                                            </p>
                                        </div>
                                    ) : chartData.length === 0 ? (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="text-sm text-slate-400">
                                                No chart data available.
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
                                                    top: 5,
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
                                                        fill: "#64748b",
                                                        fontSize: 12,
                                                    }}
                                                />

                                                <YAxis
                                                    allowDecimals={false}
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{
                                                        fill: "#64748b",
                                                        fontSize: 12,
                                                    }}
                                                />

                                                <Tooltip
                                                    cursor={{
                                                        fill: "#eff6ff",
                                                    }}
                                                    contentStyle={{
                                                        borderRadius: "12px",
                                                        border: "1px solid #e2e8f0",
                                                    }}
                                                />

                                                <Bar
                                                    dataKey="orders"
                                                    name="Orders"
                                                    fill="#6495ED"
                                                    radius={[5, 5, 0, 0]}
                                                    barSize={32}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
