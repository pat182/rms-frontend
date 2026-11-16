import { useNavigate } from "react-router-dom";
import { useEffect,useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { getRestaurantTables } from "../api/restaurantTable";
import { getApiErrorMessage } from "../api/utils";
import {TableStatuses,tableStatusStyles,tableStatusStylesCard,type TableStatus} from "../types/dashboard"
import { RestaurantTable } from "../types/restaurant";
import { TableLoader } from "../components/globals/tableLoader";
import { CalendarDays, ChevronDown,Plus,Armchair } from "lucide-react";
import { useRestaurant } from "../components/globals/restaurantContext";


const orderData = [
    { time: "9 AM", orders: 5 },
    { time: "10 AM", orders: 8 },
    { time: "11 AM", orders: 14 },
    { time: "12 PM", orders: 25 },
    { time: "1 PM", orders: 19 },
    { time: "2 PM", orders: 12 },
    { time: "3 PM", orders: 9 },
    { time: "4 PM", orders: 15 },
    { time: "5 PM", orders: 22 },
    { time: "6 PM", orders: 28 },
];

const recentOrders = [
    {
        id: 1048,
        table: "Table 03",
        items: 3,
        total: 450,
        status: "Pending",
        time: "12:45 PM",
    },
    {
        id: 1047,
        table: "Table 05",
        items: 2,
        total: 320,
        status: "Preparing",
        time: "12:38 PM",
    },
    {
        id: 1046,
        table: "Table 02",
        items: 4,
        total: 680,
        status: "Ready",
        time: "12:30 PM",
    },
    {
        id: 1045,
        table: "Table 01",
        items: 2,
        total: 250,
        status: "Served",
        time: "12:20 PM",
    },
];

const orderStatusStyles: Record<string, string> = {
    Pending: "bg-amber-50 text-amber-700",
    Preparing: "bg-blue-50 text-blue-700",
    Ready: "bg-green-50 text-green-700",
    Served: "bg-slate-100 text-slate-600",
};

const TABLE_PAGE_SIZE = 50;

export default function Dashboard() {
    const navigate = useNavigate();
    const [tableLoad, setTableLoad] = useState(false)
    const [isTableExpanded, setIsTableExpanded] = useState(true);
    const [tablePage, setTablePage] = useState(1);
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const { selectedRestaurantId } = useRestaurant();

    useEffect(() => {
        
        async function fetchTables() {
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
    }, [selectedRestaurantId]);
    return (
        <main className="p-6">
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
            
            <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">

                
                <button
                    type="button"
                    onClick={() => setIsTableExpanded((prev) => !prev)}
                    className="cursor-pointer flex w-full flex-col gap-3 text-left sm:flex-row sm:items-center sm:justify-between"
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
                                    <span className={`h-2.5 w-2.5 rounded-full ${tableStatusStyles[status]}`} />
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
                                    <Armchair aria-hidden="true" className="h-7 w-7" />
                                </div>
                                <h3 className="mt-2 text-base font-semibold text-slate-800">
                                    No tables added yet
                                </h3>

                                <p className="mt-2 max-w-sm text-sm text-slate-500">
                                    Add your first restaurant table to start monitoring
                                    table availability and dining sessions.
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
            {/* Order Overview */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50">
                {/* <div className = "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50"> */}
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">
                            Order Activity
                        </h2>
                        <p className="text-sm text-slate-500">
                            Monitor your restaurant's orders and activity.
                        </p>
                    </div>

                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                            <CalendarDays className="h-4 w-4 text-[#6495ED]" />
                        </div>

                        <select
                            className="appearance-none cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition hover:border-slate-300 focus:border-[#6495ED] focus:ring-2 focus:ring-blue-100"
                            defaultValue="today"
                        >
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 xl:col-span-3">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Order Overview
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Track your restaurant's order activity.
                                </p>
                            </div>
                        </div>

                        <div className="mb-6 inline-flex min-w-44 flex-col rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                            <p className="text-sm font-medium text-slate-500">
                                Total Orders
                            </p>
                            <p className="mt-1 text-3xl font-bold tabular-nums text-[#6495ED]">
                                157
                            </p>
                        </div>

                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={orderData}
                                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
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
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                    />
                                    <YAxis
                                        allowDecimals={false}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: "#64748b", fontSize: 12 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: "#eff6ff" }}
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
                        </div>
                    </section>

                    {/* Recent Orders */}
                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 xl:col-span-2">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Recent Orders
                                </h2>
                                <p className="text-sm text-slate-500">
                                    Latest restaurant orders.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="text-sm font-semibold text-[#6495ED] transition hover:text-blue-700"
                            >
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                                >
                                    <div className="min-w-0 space-y-1.5">
                                        <p className="text-sm font-semibold text-slate-800">
                                            Order #{order.id}
                                        </p>

                                        <p className="text-xs text-slate-500">
                                            {order.table} · {order.items} items
                                        </p>

                                        <p className="text-xs text-slate-400">
                                            {order.time}
                                        </p>
                                    </div>

                                    <div className="shrink-0 space-y-2 text-right">
                                        <p className="text-sm font-semibold text-slate-800">
                                            ₱{order.total.toLocaleString("en-PH", {
                                                minimumFractionDigits: 2,
                                            })}
                                        </p>

                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                orderStatusStyles[order.status]
                                            }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </main>
    );
}
