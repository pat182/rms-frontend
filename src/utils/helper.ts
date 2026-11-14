export function getOrderStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
        case "pending":
            return "bg-amber-100 text-amber-700";
        case "preparing":
            return "bg-blue-100 text-blue-700";
        case "ready":
        case "served":
            return "bg-emerald-100 text-emerald-700";
        default:
            return "bg-rose-100 text-rose-700";
    }
}