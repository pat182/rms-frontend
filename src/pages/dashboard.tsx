
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
} from "lucide-react";

import { OrderDateFilter } from "../types/dashboard";

import TableOverview from "../components/dashboard/tablesComponent";
import RecentOrders from "../components/dashboard/ordersComponent";

import { getChartOrders } from "../api/dashboard";
import { toLocalISO } from "../utils/helper";
import { getApiErrorMessage } from "../api/utils";
import { useRestaurant } from "../components/globals/restaurantContext";

interface OrderChartItem {
    time: string;
    orders: number;
}

export default function Dashboard() {
    const { selectedRestaurantId } = useRestaurant();
    const [totalOrders, setTotalOrders] = useState(0);
    const [chartData, setChartData] = useState<OrderChartItem[]>([]);

    const [isChartLoading, setIsChartLoading] = useState(false);
    const [chartError, setChartError] = useState("");

    const [orderDateFilter, setOrderDateFilter] =
        useState<OrderDateFilter>("today");

    const [orderDateFrom, setOrderDateFrom] = useState("");
    const [orderDateTo, setOrderDateTo] = useState("");

    const [isOrderActivityOpen, setIsOrderActivityOpen] =
        useState(true);

    // Get date range based on the selected filter
    const getOrderDateRange = () => {
        const now = new Date();

        let from: Date;
        let to = now;

        if (orderDateFilter === "custom") {
            if (!orderDateFrom || !orderDateTo) {
                return null;
            }

            from = new Date(`${orderDateFrom}T00:00:00`);
            to = new Date(`${orderDateTo}T23:59:59.999`);
        } else {
            from = new Date(now);

            if (orderDateFilter === "today") {
                from.setHours(0, 0, 0, 0);
            }

            if (orderDateFilter === "week") {
                const day = (now.getDay() + 6) % 7;

                from.setDate(now.getDate() - day);
                from.setHours(0, 0, 0, 0);
            }

            if (orderDateFilter === "month") {
                from.setDate(1);
                from.setHours(0, 0, 0, 0);
            }
        }

        return {
            order_from: toLocalISO(from),
            order_at: toLocalISO(to),
        };
    };

    // Fetch Order Activity chart data
    useEffect(() => {
        let cancelled = false;

        const fetchChartData = async () => {
            const dateRange = getOrderDateRange();

            if (!dateRange) {
                setChartData([]);
                setTotalOrders(0);
                setChartError("");
                setIsChartLoading(false);
                return;
            }

            setIsChartLoading(true);
            setChartError("");

            try {
                const response = await getChartOrders(dateRange);

                if (!response.ok) {
                    throw new Error(
                        await getApiErrorMessage(response)
                    );
                }

                const result = await response.json();

                if (cancelled) return;

                setChartData(result.data?.chart ?? []);
                setTotalOrders(result.data?.total_orders ?? 0);

            } catch (error) {
                if (cancelled) return;

                console.error("Failed to fetch order chart:", error);

                setChartData([]);
                setTotalOrders(0);

                setChartError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load order activity."
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
    }, [
        selectedRestaurantId,
        orderDateFilter,
        orderDateFrom,
        orderDateTo,
    ]);

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

                        {/* Shared Date Filter */}
                        <div className="mb-6 flex flex-col gap-3 sm:ml-auto sm:w-auto sm:min-w-[220px] sm:max-w-md">
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

                        {/* Order Activity Content */}
                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">

                            {/* Order Overview */}
                            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 xl:col-span-3">
                                <div className="mb-6">
                                    <h2 className="text-lg font-semibold text-slate-800">
                                        Order Overview
                                    </h2>

                                    <p className="text-sm text-slate-500">
                                        Track your restaurant's order activity.
                                    </p>
                                </div>

                                {/* Total Orders */}
                                <div className="mb-6 inline-flex min-w-44 flex-col rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                                    <p className="text-sm font-medium text-slate-500">
                                        Total Orders
                                    </p>

                                    <p className="mt-1 text-3xl font-bold tabular-nums text-[#6495ED]">
                                        {isChartLoading ? "..." : totalOrders}
                                    </p>
                                </div>

                                {/* Chart Error */}
                                {chartError && (
                                    <p className="mb-4 text-sm text-red-500">
                                        {chartError}
                                    </p>
                                )}

                                {/* Order Chart */}
                                <div className="relative h-72 w-full">
                                    {isChartLoading ? (
                                        <div className="flex h-full items-center justify-center">
                                            <p className="text-sm text-slate-400">
                                                Loading order activity...
                                            </p>
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

                            {/* Recent Orders */}
                            <RecentOrders
                                orderDateFilter={orderDateFilter}
                                orderDateFrom={orderDateFrom}
                                orderDateTo={orderDateTo}
                            />

                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
