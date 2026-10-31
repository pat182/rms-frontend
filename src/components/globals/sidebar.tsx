import { useState } from 'react';
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Utensils,
    Armchair,
    Settings,
    Menu,
    X,
    Store,
    ChevronUp,
    LogOut 
} from "lucide-react";
import {type SideBarProps} from "../../types/global.ts";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Manage Restaurant", icon:Store, path:"/restaurant"},
    { name: "Menu Management", icon: Utensils, path: "/menu" },
    { name: "Table Management", icon: Armchair, path: "/table" },

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
    // const 
    return (
        <aside
            className={`fixed inset-0 z-40 flex h-screen flex-col overflow-x-hidden border-r border-slate-200 bg-white transition-all duration-300
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
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-3">
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
                    className="cursor-pointer rounded-lg bg-[#6495ED] p-2 text-white transition hover:bg-blue-500"
                    aria-label={
                        sidebarOpen ? "Collapse sidebar" : "Expand sidebar"
                    }
                >
                    {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-3">
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
                                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                    isActive
                                        ? "bg-[#6495ED] text-white"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                }`
                            }
                        >
                            
                            <Icon size={20} className="shrink-0" />
                            {sidebarOpen && <span>{item.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>
            <nav className="p-3">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setSettingsOpen(!settingsOpen)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
                        <div className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                            {settingsItem.map((btmItem) => {
                                const BtmIcon = btmItem.icon;

                                return (
                                    <NavLink
                                        key={btmItem.path}
                                        to={btmItem.path}
                                        onClick={() => setSettingsOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                                isActive
                                                    ? "bg-[#6495ED] text-white"
                                                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            }`
                                        }
                                    >
                                        <BtmIcon size={20} className="shrink-0" />
                                        <span>{btmItem.name}</span>
                                    </NavLink>
                                );
                            })}
                        </div>
                    )}
                </div>
            </nav>
        </aside>
    );
}