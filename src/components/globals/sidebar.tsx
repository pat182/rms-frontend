import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    Utensils,
    Armchair,
    Clock3,
    Settings,
    Menu,
    X,
    Store,
    ChevronDown,
    ChevronUp,
    LogOut 
} from "lucide-react";
import {type SideBarProps} from "../../types/global.ts";
import { logout } from "../../api/auth";
import { useToast } from "./toastContext";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Manage Restaurant", icon:Store, path:"/restaurant"},
    { name: "Menu Management", icon: Utensils, path: "/menu" },

    // { name: "Settings", icon: Settings, path: "/settings" },
];

const settingsItem = [
    {name: "Logout",icon:LogOut,path:"/"}
]

export default function SideBar({
    sidebarOpen,
    setSidebarOpen,
}: SideBarProps) {

    const [settingsOpen, setSettingsOpen] = useState(false);
    const location = useLocation();
    const [tablesOpen, setTablesOpen] = useState(
        location.pathname.startsWith("/table")
    );
    const [loggingOut, setLoggingOut] = useState(false);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);
        try {
            const response = await logout();
            if (!response.ok) {
                showToast("Unable to log out. Please try again.", "error");
                return;
            }

            localStorage.removeItem("user");
            localStorage.removeItem("selectedRestaurantId");
            localStorage.removeItem("csrf_token");
            navigate("/login", { replace: true });
        } catch {
            showToast("Unable to log out. Please try again.", "error");
        } finally {
            setLoggingOut(false);
        }
    };

    // const 
    return (
        <aside
            className={`fixed inset-0 z-40 flex h-screen flex-col overflow-x-hidden border-r border-slate-200/80 bg-white shadow-sm transition-all duration-300
                ${
                    sidebarOpen
                        ? "w-screen translate-x-0"
                        : "w-screen -translate-x-full"
                }
                md:inset-y-0 md:left-0 md:right-auto md:h-screen
                ${
                    sidebarOpen
                        ? "md:w-64 md:translate-x-0"
                        : "md:w-16 md:translate-x-0"
                }`}>
            {/* Sidebar Header */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-3">
                {sidebarOpen && (
                    <img
                        src="/rms-logo.png"
                        alt="Restaurant Management System"
                        className="h-10 w-auto object-contain"
                    />
                )}

                <button
                    type="button"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="cursor-pointer rounded-xl bg-[#6495ED] p-2 text-white shadow-sm shadow-blue-200 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2"
                    aria-label={
                        sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                    }
                >
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
                {menuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            onClick={() => {
                                if (window.innerWidth < 768) {
                                    setSidebarOpen(false);
                                }
                            }}
                            title={!sidebarOpen ? item.name : undefined}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                    isActive
                                    ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100"
                                    : "text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900"
                                }`
                            }
                        >
                            
                            <Icon size={20} className="shrink-0" />
                            {sidebarOpen && <span>{item.name}</span>}
                        </NavLink>
                    );
                })}
                <div>
                    <button
                        type="button"
                        aria-expanded={tablesOpen}
                        onClick={() => {
                            if (!sidebarOpen) {
                                setSidebarOpen(true);
                                setTablesOpen(true);
                                return;
                            }
                            setTablesOpen((open) => !open);
                        }}
                        title={!sidebarOpen ? "Tables" : undefined}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                            location.pathname.startsWith("/table")
                                ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100"
                                : "text-slate-600 hover:translate-x-0.5 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                        <Armchair size={20} className="shrink-0" />
                        {sidebarOpen && (
                            <>
                                <span className="flex-1">Tables</span>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform ${tablesOpen ? "rotate-180" : ""}`}
                                />
                            </>
                        )}
                    </button>
                    {tablesOpen && sidebarOpen && (
                        <div className="ml-4 mt-1 border-l border-slate-200 pl-2">
                            <button
                                type="button"
                                className="block w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                                <Armchair size={16} className="mr-2 inline-block" />
                                Table Management
                            </button>
                            <NavLink
                                to="/table"
                                onClick={() => {
                                    if (window.innerWidth < 768) {
                                        setSidebarOpen(false);
                                    }
                                }}
                                className={({ isActive }) =>
                                    `block rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    }`
                                }
                            >
                                <Clock3 size={16} className="mr-2 inline-block" />
                                Dining Sessions
                            </NavLink>
                        </div>
                    )}
                </div>
            </nav>
            <nav className="p-3">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    >
                        <Settings size={20} className="shrink-0" />

                        {sidebarOpen && (
                            <>
                                <span className="flex-1 text-left">Settings</span>
                                <ChevronUp
                                    size={16}
                                    className={`transition-transform ${
                                        settingsOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </>
                        )}

                        
                    </button>
                    {settingsOpen && sidebarOpen && (
                        <div className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-xl border border-slate-200/80 bg-white p-2 shadow-xl shadow-slate-900/10">
                            {settingsItem.map((btmItem) => {
                                const BtmIcon = btmItem.icon;

                                return (
                                    <button
                                        key={btmItem.path}
                                        type="button"
                                        disabled={loggingOut}
                                        onClick={() => {
                                            setSettingsOpen(false);
                                            void handleLogout();
                                        }}
                                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-wait disabled:opacity-60"
                                    >
                                        <BtmIcon size={20} className="shrink-0" />
                                        <span>{loggingOut ? "Logging out..." : btmItem.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
}