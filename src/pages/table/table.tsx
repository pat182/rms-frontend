


import { useEffect, useState } from "react";
import { X } from "lucide-react";
import QRCode from "qrcode";
import { getRestaurantTables } from "../../api/restaurantTable.ts";
import { getApiErrorMessage } from "../../api/utils.ts";
import type { RestaurantTable } from "../../types/restaurant.ts";
import { TableLoader } from "../../components/globals/tableLoader.tsx";
import RestaurantTableActions from "../../components/restaurantTable/restaurantTableAction.tsx";
import { CUSTOMER_APP } from '../../config'
import { useToast } from "../../components/globals/toastContext.tsx";

export default function Table() {
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [qrTable, setQrTable] = useState<RestaurantTable | null>(null);
    const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
    const { showToast } = useToast();

    const handleViewQr = (table: RestaurantTable) => {
        if (!CUSTOMER_APP) {
            showToast("The customer app URL is not configured.", "error");
            return;
        }
        if (!table.qr_token) {
            showToast("This table does not have a QR token.", "error");
            return;
        }

        setQrCodeDataUrl("");
        setQrTable(table);
    };

    useEffect(() => {
        if (!qrTable) return;

        const tableToEncode = qrTable;
        let cancelled = false;

        async function generateQrCode() {
            const customerUrl = `${CUSTOMER_APP.replace(/\/+$/, "")}/${encodeURIComponent(tableToEncode.qr_token)}`;

            try {
                const dataUrl = await QRCode.toDataURL(customerUrl, {
                    width: 256,
                    margin: 2,
                });
                if (!cancelled) {
                    setQrCodeDataUrl(dataUrl);
                }
            } catch (qrGenerationError) {
                if (!cancelled) {
                    showToast(
                        qrGenerationError instanceof Error
                            ? qrGenerationError.message
                            : "Unable to generate the table QR code.",
                        "error"
                    );
                }
            }
        }

        void generateQrCode();

        return () => {
            cancelled = true;
        };
    }, [qrTable, showToast]);

    useEffect(() => {
        if (!qrTable) return;

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setQrTable(null);
        }

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [qrTable]);

    useEffect(() => {
        let cancelled = false;

        async function fetchTables() {
            try {
                setLoading(true);
                setError("");

                const response = await getRestaurantTables();
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

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="border-b border-slate-200 px-6 py-4">ID</th>
                                <th className="border-b border-slate-200 px-6 py-4">Table Name</th>
                                <th className="border-b border-slate-200 px-6 py-4">Capacity</th>
                                <th className="border-b border-slate-200 px-6 py-4">Status</th>
                                <th className="border-b border-slate-200 px-6 py-4">Dining Session</th>
                                <th className="border-b border-slate-200 px-6 py-4">Sessions</th>
                                <th className="border-b border-slate-200 px-6 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <TableLoader />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} role="alert" className="px-6 py-12 text-center text-red-600">
                                        {error}
                                    </td>
                                </tr>
                            ) : tables.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        No restaurant tables found.
                                    </td>
                                </tr>
                            ) : (
                                tables.map((table, index) => {
                                    const tableName = table.table_name || `Table ${table.id ?? index + 1}`;
                                    const activeSession = table.dining_sessions.find(
                                        (session) => session.is_active
                                    );

                                    return (
                                        <tr
                                            key={table.id ?? `${tableName}-${index}`}
                                            className="transition-colors hover:bg-blue-50/50"
                                        >
                                            <td className="px-6 py-4 text-xs font-medium text-slate-400">
                                                {table.id}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-slate-800">
                                                {tableName}
                                            </td>
                                            <td className="px-6 py-4">{table.capacity}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                        table.is_active
                                                            ? "bg-emerald-50 text-emerald-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {table.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                        activeSession
                                                            ? "bg-amber-50 text-amber-700"
                                                            : "bg-slate-100 text-slate-500"
                                                    }`}
                                                >
                                                    {activeSession ? "In use" : "Available"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {table.dining_sessions.length}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <RestaurantTableActions
                                                    table={table}
                                                    onViewQr={handleViewQr}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>
            </div>
            {qrTable && (
                <div
                    className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setQrTable(null);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-label="Table QR code"
                        className="rounded-xl bg-white p-2 shadow-2xl"
                    >
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => setQrTable(null)}
                                className="rounded-lg p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                                aria-label="Close QR code dialog"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {qrCodeDataUrl ? (
                            <img
                                src={qrCodeDataUrl}
                                alt={`QR code for ${qrTable.table_name}`}
                                className="h-64 w-64 max-w-full object-contain"
                            />
                        ) : (
                            <div
                                role="status"
                                aria-label="Generating QR code"
                                className="flex h-64 w-64 items-center justify-center"
                            >
                                <TableLoader />
                            </div>
                        )}
                    </section>
                </div>
            )}
        </main>
    );
}