import { AlertCircle } from "lucide-react";

type ErrorDisplayProps = {
    title: string;
    message: string;
    className?: string;
};

export default function ErrorDisplay({
    title,
    message,
    className = "",
}: ErrorDisplayProps) {
    return (
        <div
            role="alert"
            className={`flex items-start gap-4 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 shadow-sm ${className}`}
        >
            <div className="rounded-xl bg-white p-2 text-rose-600 shadow-sm">
                <AlertCircle aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-rose-700">{message}</p>
            </div>
        </div>
    );
}
