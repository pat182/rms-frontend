
import { CheckCircle, XCircle, X } from "lucide-react";
import type {ToastProps} from "../../types/global.ts"


export default function Toast({ message, type, onClose }: ToastProps) {
    const isSuccess = type === "success";

    return (
        <div
            role="alert"
            className={`z-50 flex w-full max-w-sm items-start gap-3 rounded-lg border bg-white p-4 shadow-lg ${
                isSuccess ? "border-green-200" : "border-red-200"
            }`}
        >
            {isSuccess ? (
                <CheckCircle className="mt-0.5 text-green-600" size={22} />
            ) : (
                <XCircle className="mt-0.5 text-red-600" size={22} />
            )}

            <div className="flex-1">
                <p className={`font-semibold ${
                    isSuccess ? "text-green-700" : "text-red-700"
                }`}>
                    {isSuccess ? "Success" : "Error"}
                </p>

                <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>

            <button
                type="button"
                onClick={onClose}
                aria-label="Close notification"
                className="text-gray-400 hover:text-gray-700"
            >
                <X size={18} />
            </button>
        </div>
    );
}
