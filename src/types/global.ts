import type { LucideIcon } from "lucide-react";
import type {
    Dispatch,
    ReactNode,
    SetStateAction,
} from "react";
import type { DiningSession } from "./restaurant";

export type SideBarProps = {
    sidebarOpen: boolean;
    setSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

export type ToastProps = {
    message: string;
    type: "success" | "error";
    onClose: () => void;
};

export type ToastType = "success" | "error";

export type ToastItem = {
    id: number;
    message: string;
    type: ToastType;
};

export type ToastContextType = {
    showToast: (message: string, type: ToastType) => void;
};

export type CollapsibleSectionProps = {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
    className?: string;
};

export type GetQueryParams = {
    page?: number;
    page_size?: number;
    sort_by?: string;
    sort_order?: "asc" | "desc";
    search?: string;
};

export type Country = {
    id: number;
    country_name: string;
    country_code: string;
    phone_code: string;
};

export const diningSeshActionMsg = {
    created: "new dining session",
    expiration_warn: "dining session about to expire",
    expired: "session Expired",
};

type DiningSeshAction = keyof typeof diningSeshActionMsg;

export type DiningSessionNotificationData = {
    dining_session: {
        table_id: number;
        session_id: number;
        session_token: string;
        table_name: string;
        is_active: boolean;
        started_at: string;
        closed_at: string | null;
        status: "pending" | "verified" | "closed";
    };
    action: DiningSeshAction;
};

export type DiningSessionCreatedMessage = {
    event: string;
    data: DiningSessionNotificationData;
};

export type HeaderNotification = {
    id: string;
    title: string;
    content: DiningSessionNotificationData["dining_session"];
    action : DiningSessionNotificationData["action"];
    receivedAt: string;
};

export type ActionMenuItem<T> = {
    label: string;
    icon: LucideIcon;
    onSelect: (item: T) => void;
    variant?: "default" | "danger";
    separatorBefore?: boolean;
};

export type ActionMenuProps<T> = {
    item: T;
    itemLabel: string;
    actions: ActionMenuItem<T>[];
};

export type ConfirmationDialogProps = {
    action: string;
    onYes: () => void;
    onNo: () => void;
    isProcessing?: boolean;
};

export type TablePaginationProps = {
    page: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    loading: boolean;
    itemLabel: string;
    onPageChange: (page: number) => void;
};

export type InfiniteScrollOptions = {
    element: HTMLElement;
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    threshold?: number;
};