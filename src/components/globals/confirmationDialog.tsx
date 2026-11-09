import { useEffect } from "react";
import type { ConfirmationDialogProps } from "../../types/global.ts";

export default function ConfirmationDialog({
    action,
    onYes,
    onNo,
    isProcessing = false,
}: ConfirmationDialogProps) {
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape" && !isProcessing) {
                onNo();
            }
        }

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isProcessing, onNo]);

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isProcessing) {
                    onNo();
                }
            }}
        >
            <section
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirmation-dialog-title"
                className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl"
            >
                <h2 id="confirmation-dialog-title" className="text-lg font-semibold text-slate-800">
                    Confirm action
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                    Are you sure you want to {action}?
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onNo}
                        disabled={isProcessing}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        No
                    </button>
                    <button
                        type="button"
                        onClick={onYes}
                        disabled={isProcessing}
                        className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isProcessing ? "Please wait..." : "Yes"}
                    </button>
                </div>
            </section>
        </div>
    );
}
