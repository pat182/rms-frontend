
import { OrderDateFilter } from "../types/dashboard";
import { InfiniteScrollOptions } from "../types/global";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_NUMBER_CHARACTER_REGEX = /^[+\d\s().-]$/;

export const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];

export function isValidEmail(email: string): boolean {
    return EMAIL_REGEX.test(email.trim());
}

export function isValidContactNumberFormat(contactNumber: string): boolean {
    return Array.from(contactNumber.trim()).every((character) =>
        CONTACT_NUMBER_CHARACTER_REGEX.test(character),
    );
}

export function sanitizeContactNumber(contactNumber: string): string {
    return Array.from(contactNumber)
        .filter((character) => CONTACT_NUMBER_CHARACTER_REGEX.test(character))
        .join("");
}

export function parseMoneyValue(value: number | string | undefined): number {
    if (value === undefined || value === null || value === "") {
        return 0;
    }

    const numericValue = Number(String(value).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(numericValue) ? numericValue : 0;
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

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

export function toLocalISO(date: Date): string {
    const offset = -date.getTimezoneOffset();
    const sign = offset >= 0 ? "+" : "-";
    const hours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
    const minutes = String(Math.abs(offset) % 60).padStart(2, "0");

    const localDate = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");

    const localTime = [
        String(date.getHours()).padStart(2, "0"),
        String(date.getMinutes()).padStart(2, "0"),
        String(date.getSeconds()).padStart(2, "0"),
    ].join(":");

    return `${localDate}T${localTime}${sign}${hours}:${minutes}`;
}


export function handleInfiniteScroll({
    element,
    loading,
    hasMore,
    onLoadMore,
    threshold = 100,
}: InfiniteScrollOptions): void {
    const { scrollTop, scrollHeight, clientHeight } = element;

    const isNearBottom =
        scrollHeight - scrollTop - clientHeight < threshold;

    if (isNearBottom && !loading && hasMore) {
        onLoadMore();
    }
}
