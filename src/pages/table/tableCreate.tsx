import { useState, type FormEvent } from "react";
import { useRef } from "react";
import { AlertCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createRestaurantTable } from "../../api/restaurantTable.ts";
import { getApiErrorMessage } from "../../api/utils.ts";
import { useToast } from "../../components/globals/toastContext.tsx";
import { useRestaurant } from "../../components/globals/restaurantContext.tsx";
import { TableDraft } from "../../types/restaurant.ts";



export default function TableCreate() {
    const navigate = useNavigate();
    const { selectedRestaurantId } = useRestaurant();
    const { showToast } = useToast();
    const nextDraftId = useRef(2);
    const [tables, setTables] = useState<TableDraft[]>([
        { id: 1, table_name: "", capacity: "", is_active: true },
    ]);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    function updateTable<K extends keyof TableDraft>(
        id: number,
        key: K,
        value: TableDraft[K],
    ) {
        setTables((current) =>
            current.map((table) => table.id === id ? { ...table, [key]: value } : table)
        );
    }

    function addTable() {
        const id = nextDraftId.current++;
        setTables((current) => [
            ...current,
            { id, table_name: "", capacity: "", is_active: true },
        ]);
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!selectedRestaurantId) {
            setError("Select a restaurant before creating a table.");
            return;
        }

        const invalidTable = tables.find((table) => {
            const parsedCapacity = Number(table.capacity);
            return !table.table_name.trim()
                || !Number.isInteger(parsedCapacity)
                || parsedCapacity < 1;
        });
        if (invalidTable) {
            setError("Each table needs a name and a whole-number capacity greater than zero.");
            return;
        }

        try {
            setIsSaving(true);
            const failedTables: TableDraft[] = [];
            const failureMessages: string[] = [];
            let createdCount = 0;

            for (const table of tables) {
                try {
                    const response = await createRestaurantTable({
                        table_name: table.table_name.trim(),
                        capacity: Number(table.capacity),
                        is_active: table.is_active,
                    });

                    if (!response.ok) {
                        throw new Error(await getApiErrorMessage(response));
                    }

                    createdCount++;
                } catch (createError) {
                    failedTables.push(table);
                    failureMessages.push(
                        `${table.table_name.trim()}: ${
                            createError instanceof Error
                                ? createError.message
                                : "Unable to create the table."
                        }`
                    );
                }
            }

            if (failedTables.length > 0) {
                setTables(failedTables);
                if (createdCount > 0) {
                    showToast(`${createdCount} table${createdCount === 1 ? "" : "s"} created successfully.`, "success");
                }
                setError(
                    `${createdCount} of ${tables.length} tables created. Fix or retry the remaining tables:\n${failureMessages.join("\n")}`
                );
                return;
            }

            showToast(
                `${createdCount} table${createdCount === 1 ? "" : "s"} created successfully.`,
                "success"
            );
            navigate("/table");
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Unable to create the table."
            );
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <main className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-700">Create Tables</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Add one or more tables to the selected restaurant.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {tables.map((table, index) => (
                        <section
                            key={table.id}
                            aria-labelledby={`tableTitle-${table.id}`}
                            className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
                        >
                            <div className="flex items-center justify-between gap-4">
                                {tables.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setTables((current) => current.filter((item) => item.id !== table.id))}
                                        disabled={isSaving}
                                        aria-label={`Remove ${table.table_name || `table ${index + 1}`}`}
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                                    >
                                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                                        Remove
                                    </button>
                                )}
                            </div>

                            <div className="grid gap-5 sm:grid-cols-[3fr_1fr]">
                                <div>
                                    <label htmlFor={`tableName-${table.id}`} className="mb-1 block text-sm font-medium text-slate-600">
                                        Table Name
                                    </label>
                                    <input
                                        id={`tableName-${table.id}`}
                                        value={table.table_name}
                                        onChange={(event) => updateTable(table.id, "table_name", event.target.value)}
                                        required
                                        maxLength={100}
                                        placeholder="e.g. Table 1"
                                        disabled={isSaving}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                                    />
                                </div>

                                <div>
                                    <label htmlFor={`capacity-${table.id}`} className="mb-1 block text-sm font-medium text-slate-600">
                                        Seating Capacity
                                    </label>
                                    <input
                                        id={`capacity-${table.id}`}
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={table.capacity}
                                        onChange={(event) => updateTable(table.id, "capacity", event.target.value)}
                                        required
                                        disabled={isSaving}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-slate-700">
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={table.is_active}
                                    aria-label={`Toggle ${table.table_name || `table ${index + 1}`} status`}
                                    onClick={() => updateTable(table.id, "is_active", !table.is_active)}
                                    disabled={isSaving}
                                    className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 disabled:cursor-not-allowed ${
                                        table.is_active ? "bg-[#6495ED]" : "bg-slate-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                            table.is_active ? "translate-x-6" : "translate-x-1"
                                        }`}
                                    />
                                </button>
                                <span>{table.is_active ? "Active" : "Inactive"} table</span>
                            </div>
                        </section>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addTable}
                    disabled={isSaving}
                    className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-[#6495ED]/50 px-3 py-2 text-sm font-medium text-[#4f7ed4] transition hover:border-[#6495ED] hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    + Add another table
                </button>

                {error && (
                    <div role="alert" className="flex items-start gap-3 whitespace-pre-line text-sm text-rose-700">
                        <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/table")}
                        disabled={isSaving}
                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        aria-busy={isSaving}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#6495ED] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSaving && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        )}
                        {isSaving ? "Creating..." : `Create ${tables.length} Table${tables.length === 1 ? "" : "s"}`}
                    </button>
                </div>
            </form>
        </main>
    );
}
