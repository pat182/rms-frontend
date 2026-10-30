import { Menu } from "lucide-react";

export default function TopBar({
    sidebarOpen,
    setSidebarOpen,
}: SideBarProps) {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const restaurantName =
        user?.restaurants?.[0]?.restaurant_name ?? "Restaurant";

    return (
        <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
            {/* Mobile-only sidebar toggle */}
            <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="cursor-pointer rounded-lg bg-[#6495ED] p-2 text-white transition hover:bg-blue-500 md:hidden"
                aria-label="Toggle sidebar"
            >
                <Menu size={22} />
            </button>

            <h1 className="text-lg font-semibold text-slate-800">
                {restaurantName}
            </h1>
        </header>
    );
}
