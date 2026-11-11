
import { useEffect } from "react";
import { X } from "lucide-react";
import type { DiningSession } from "../../types/restaurant.ts";

type OrdersModalProps = {
    session: DiningSession;
    onClose: () => void;
};

export default function OrdersModal({ session, onClose }: OrdersModalProps) {
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
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 p-4"
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
                className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="orders-modal-title" className="text-xl font-semibold text-slate-800">
                            Orders
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Session #{session.id} · {session.restaurant_table.table_name}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close orders"
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <X aria-hidden="true" size={20} />
                    </button>
                </div>
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    Order details will appear here.
                </div>
            </section>
        </div>
    );
}