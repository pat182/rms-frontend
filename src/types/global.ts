import type { LucideIcon } from "lucide-react";

import type {
    Dispatch,
    ReactNode,
    SetStateAction,
} from 'react';

export type SideBarProps = {
    sidebarOpen: boolean;
    setSidebarOpen: Dispatch<
        SetStateAction<boolean>
    >;
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

export type HeaderNotification = {
    id: number;
    title: string;
    content: {
        session_id: number;
        session_token: string;
        table_name: string;
        is_active: boolean;
        started_at: string;
        closed_at: string | null;
        status: "pending" | "verified" | "closed";
    };
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
