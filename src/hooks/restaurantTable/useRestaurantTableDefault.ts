import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../components/globals/toastContext.tsx";
import { useRestaurant } from "../../components/globals/restaurantContext.tsx";
import { deleteRestaurantTable, getRestaurantTables } from "../../api/restaurantTable.ts";
import { getApiErrorMessage } from "../../api/utils.ts";
import type { RestaurantTable } from "../../types/restaurant.ts";

const TABLE_PAGE_SIZE = 10;

export default function useRestaurantTableDefault() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { selectedRestaurantId } = useRestaurant();
    const [tables, setTables] = useState<RestaurantTable[]>([]);
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [tableToDelete, setTableToDelete] = useState<RestaurantTable | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function fetchTables() {
            try {
                setLoading(true);
                setError("");

                const response = await getRestaurantTables({
                    page,
                    page_size: TABLE_PAGE_SIZE,
                });
                if (!response.ok) {
                    throw new Error(await getApiErrorMessage(response));
                }

                const result: { data?: RestaurantTable[]; total_items?: number } = await response.json();
                if (!Array.isArray(result.data)) {
                    throw new Error("The restaurant tables response was invalid.");
                }

                if (!cancelled) {
                    setTables(result.data);
                    setTotalItems(
                        typeof result.total_items === "number"
                            ? result.total_items
                            : (page - 1) * TABLE_PAGE_SIZE + result.data.length
                    );
                    setHasNextPage(
                        typeof result.total_items === "number"
                            ? page * TABLE_PAGE_SIZE < result.total_items
                            : result.data.length === TABLE_PAGE_SIZE
                    );
                }
            } catch (fetchError) {
                if (!cancelled) {
                    setError(
                        fetchError instanceof Error
                            ? fetchError.message
                            : "Unable to load restaurant tables."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void fetchTables();
        return () => {
            cancelled = true;
        };
    }, [page, selectedRestaurantId]);

    useEffect(() => {
        setPage(1);
    }, [selectedRestaurantId]);

    function handleEdit(table: RestaurantTable) {
        navigate(`/table/edit/${table.id}`);
    }

    function handleDelete(table: RestaurantTable) {
        setTableToDelete(table);
    }

    async function confirmDelete() {
        if (!tableToDelete || isDeleting) return;

        try {
            setIsDeleting(true);
            const response = await deleteRestaurantTable(tableToDelete.id);
            if (!response.ok) {
                throw new Error(await getApiErrorMessage(response));
            }

            setTables((currentTables) =>
                currentTables.filter((table) => table.id !== tableToDelete.id)
            );
            setTotalItems((currentTotal) => Math.max(0, currentTotal - 1));
            if (tables.length === 1 && page > 1) {
                setPage((currentPage) => currentPage - 1);
            } else if (tables.length === 1) {
                setHasNextPage(false);
            }
            showToast(`${tableToDelete.table_name} deleted successfully.`, "success");
            setTableToDelete(null);
        } catch (deleteError) {
            showToast(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Unable to delete the table.",
                "error"
            );
            setTableToDelete(null);
        } finally {
            setIsDeleting(false);
        }
    }

    return {
        tables,
        page,
        pageSize: TABLE_PAGE_SIZE,
        totalItems,
        hasNextPage,
        setPage,
        loading,
        error,
        tableToDelete,
        isDeleting,
        handleEdit,
        handleDelete,
        confirmDelete,
        closeDeleteConfirmation: () => setTableToDelete(null),
    };
}
