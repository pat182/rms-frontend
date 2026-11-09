import type { TablePaginationProps } from "../../types/global.ts";

export default function TablePagination({
    page,
    pageSize,
    totalItems,
    hasNextPage,
    loading,
    itemLabel,
    onPageChange,
}: TablePaginationProps) {
    const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastItem = Math.min((page - 1) * pageSize + pageSize, totalItems);

    return (
        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
                {totalItems === 0
                    ? `No ${itemLabel}`
                    : `Showing ${firstItem}-${lastItem} of ${totalItems} ${itemLabel}`}
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={loading || page <= 1}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Previous
                </button>
                <span className="px-2 text-sm text-slate-600">Page {page}</span>
                <button
                    type="button"
                    onClick={() => onPageChange(page + 1)}
                    disabled={loading || !hasNextPage}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
