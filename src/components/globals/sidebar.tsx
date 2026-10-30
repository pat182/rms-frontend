import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Utensils,
    Armchair,
    Settings,
    Menu,
    X,
} from "lucide-react";
import {type SideBarProps} from "../../types/global.ts";

const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Menu Management", icon: Utensils, path: "/menu" },
    { name: "Table Management", icon: Armchair, path: "/table" },
    { name: "Settings", icon: Settings, path: "/settings" },
];

export default function SideBar({
    sidebarOpen,
    setSidebarOpen,
}: SideBarProps) {
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
        </aside>
    );
}