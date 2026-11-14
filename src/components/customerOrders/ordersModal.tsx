
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ClipboardList, X } from "lucide-react";
import { OrderData, OrderItem, OrdersModalProps } from "../../types/order.ts";
import { getSessionOrder } from "../../api/customerOrder.ts";
import { getApiErrorMessage } from "../../api/utils.ts";
import { getOrderStatusClass} from "../../utils/helper.ts";
import { TableLoader } from "../globals/tableLoader.tsx";


export default function OrdersModal({ session, onClose }: OrdersModalProps) {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchOrders() {
            try {
                setIsLoading(true);
                setErrorMessage(null);
                console.log(session)
                const response = await getSessionOrder(session.session_token);
                if (!response.ok) {
                    throw new Error(await getApiErrorMessage(response));
                }

                const result = await response.json();
                
                if (isMounted) {
                    
                    setOrders(result.data);
                }

            } catch (error) {
                if (isMounted) {
                    setErrorMessage(
                        error instanceof Error ? error.message : "Unable to load the order details."
                    );
                    setOrders([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void fetchOrders();

        return () => {
            isMounted = false;
        };
    }, [session.session_token]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);


    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-[2px] sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="orders-modal-title"
                className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            >
                <div className="h-1 shrink-0 bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300" />
                <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-7 sm:py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 text-blue-600 ring-1 ring-blue-100">
                            <ClipboardList aria-hidden="true" size={21} />
                        </div>
                        <div className="min-w-0">
                            <h2 id="orders-modal-title" className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                Orders
                            </h2>
                            <p className="mt-1 truncate text-sm text-slate-500">
                                Session #{session.id}
                                <span className="mx-2 text-slate-300">•</span>
                                {session.restaurant_table.table_name}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                                <time dateTime={session.started_at}>
                                    Started: {new Date(session.started_at).toLocaleString()}
                                </time>
                                {session.closed_at && (
                                    <time dateTime={session.closed_at}>
                                        Closed: {new Date(session.closed_at).toLocaleString()}
                                    </time>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close orders"
                        className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <X aria-hidden="true" size={20} />
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/70 px-4 py-4 sm:px-6 sm:py-5">
                {isLoading ? (
                    <TableLoader />
                ) : errorMessage ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
                        {errorMessage}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
                        <p className="text-sm font-semibold text-slate-700">No orders yet</p>
                        <p className="mt-1 text-sm text-slate-500">There are no orders for this session.</p>
                    </div>
                ) : (
                    <div className="space-y-4 pb-1">
                        {orders.map((order) => {
                            console.log(order);
                            return (
                                <article key={`${order.id}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/50 transition duration-200 hover:border-blue-200 hover:shadow-md">
                                <details className="group">
                                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-50/70 via-white to-white px-4 py-3.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500 [&::-webkit-details-marker]:hidden sm:px-5">
                                        <div>
                                            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
                                                <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-700">
                                                    #
                                                </span>
                                                <span>Order {order.id}</span>
                                            </h3>
                                            {order.created_at && (
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {new Date(order.created_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-4 gap-y-2">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ring-black/5 ${getOrderStatusClass(order.status)}`}>
                                                {order.status ?? "Unknown"}
                                            </span>
                                            <ChevronDown aria-hidden="true" size={18} className="text-slate-400 transition-transform duration-200 group-open:rotate-180" />
                                        </div>
                                    </summary>

                                    <div className="border-t border-slate-100">
                                        <div className="divide-y divide-slate-100">
                                            {order.items.length === 0 ? (
                                                <p className="px-4 py-5 text-sm text-slate-500 sm:px-5">No items in this order.</p>
                                            ) : (
                                                order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3.5 transition-colors hover:bg-blue-50/40 sm:px-5">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate font-medium text-slate-800">{item.item_name}</p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Qty {item.quantity}
                                                            </p>
                                                            {item.special_request && (
                                                                <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-500">
                                                                    <span className="font-medium text-slate-600">Special request: </span>
                                                                    {item.special_request}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex shrink-0 items-center gap-1 whitespace-nowrap text-right">
                                                            <span className="text-xs font-medium text-slate-500">Price:</span>
                                                            <span className="text-sm font-semibold tabular-nums text-slate-800">{item.subtotal}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </details>
                                <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/70 px-4 py-3.5 sm:px-5">
                                    <span className="text-sm text-slate-500">
                                        {order.items.length} item{order.items.length === 1 ? "" : "s"}
                                    </span>
                                    <div className="text-right">
                                        <span className="mr-2 text-xs font-medium uppercase tracking-wide text-slate-400">Total</span>
                                        <span className="text-base font-bold tabular-nums text-blue-800">{order.subtotal}</span>
                                    </div>
                                </div>
                                </article>
                            )
                        })}
                    </div>
                )}
                </div>
            </section>
        </div>
    );
}