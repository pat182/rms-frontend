
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";

import Toast from "./toast";
import {type ToastType,ToastContextType,ToastItem} from "../../types/global.ts";


const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const nextId = useRef(0);
    const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(
        new Map()
    );

    const dismissToast = useCallback((id: number) => {
        const timer = timers.current.get(id);

        if (timer) {
            clearTimeout(timer);
            timers.current.delete(id);
        }

        setToasts((previous) =>
            previous.filter((toast) => toast.id !== id)
        );
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType) => {
            const id = ++nextId.current;

            setToasts((previous) => [
                ...previous,
                { id, message, type },
            ]);

            const timer = setTimeout(() => {
                dismissToast(id);
            }, 4000);

            timers.current.set(id, timer);
        },
        [dismissToast]
    );

    useEffect(() => {
        return () => {
            timers.current.forEach((timer) => clearTimeout(timer));
            timers.current.clear();
        };
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            <div className="fixed right-5 top-5 z-50 flex w-80 max-w-[calc(100vw-2.5rem)] flex-col gap-3">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => dismissToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return context;
}
