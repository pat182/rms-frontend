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
