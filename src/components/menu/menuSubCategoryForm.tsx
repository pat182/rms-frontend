
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import type { MenuSubcategoriesProps } from "../../types/menu.ts";
import MenuItemFormFields from "./menuItemFormFields.tsx";
import CollapsibleSection from "../globals/collapsibleSection.tsx";

type SortableEntryProps = {
    id: number;
    label: string;
    className: string;
    children: ReactNode;
};

function SortableEntry({
    id,
    label,
    className,
    children,
}: SortableEntryProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={`${className} ${
                isDragging ? "relative z-10 opacity-70 shadow-lg" : ""
            }`}
        >
            <button
                ref={setActivatorNodeRef}
                type="button"
                aria-label={`Drag ${label}`}
                className="touch-none cursor-grab rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
                {...attributes}
                {...listeners}
            >
                <GripVertical size={20} aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1">{children}</div>
        </div>
    );
}

export default function MenuSubcategories({
    categoryId,
    subcategories,
    onAddSubcategory,
    onChangeSubcategory,
    onRemoveSubcategory,
    onReorderSubcategories,
    onAddSubcategoryMenuItem,
    onChangeSubcategoryMenuItem,
    onRemoveSubcategoryMenuItem,
    onReorderSubcategoryMenuItems,
    onImageSelectSubcategoryMenuItem,
    onDeleteExistingImageSubcategoryMenuItem,
}: MenuSubcategoriesProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );
    const sortedSubcategories = [...subcategories].sort(
        (first, second) => first.sort_order - second.sort_order,
    );

    const handleSubcategoryDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = sortedSubcategories.findIndex(
            (subcategory) => subcategory.id === active.id,
        );
        const newIndex = sortedSubcategories.findIndex(
            (subcategory) => subcategory.id === over.id,
        );
        if (oldIndex < 0 || newIndex < 0) return;

        onReorderSubcategories(
            categoryId,
            arrayMove(sortedSubcategories, oldIndex, newIndex).map(
                (subcategory) => subcategory.id,
            ),
        );
    };

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">
                Subcategories
            </h4>

            {sortedSubcategories.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleSubcategoryDragEnd}
                >
                    <SortableContext
                        items={sortedSubcategories.map(
                            (subcategory) => subcategory.id
                        )}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {sortedSubcategories.map((subcategory) => {
                                const sortedItems = [...subcategory.menu_items].sort(
                                    (first, second) =>
                                        first.sort_order - second.sort_order
                                );
                                const handleItemDragEnd = ({
                                    active,
                                    over,
                                }: DragEndEvent) => {
                                    if (!over || active.id === over.id) return;

                                    const oldIndex = sortedItems.findIndex(
                                        (item) => item.id === active.id
                                    );
                                    const newIndex = sortedItems.findIndex(
                                        (item) => item.id === over.id
                                    );
                                    if (oldIndex < 0 || newIndex < 0) return;

                                    onReorderSubcategoryMenuItems(
                                        categoryId,
                                        subcategory.id,
                                        arrayMove(
                                            sortedItems,
                                            oldIndex,
                                            newIndex
                                        ).map((item) => item.id)
                                    );
                                };

                                return (
                                    <SortableEntry
                                        key={subcategory.id}
                                        id={subcategory.id}
                                        label={
                                            subcategory.category_name ||
                                            "subcategory"
                                        }
                                        className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <CollapsibleSection
                                            title={
                                                subcategory.category_name ||
                                                "New Subcategory"
                                            }
                                        >
                                            <div className="space-y-4">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <div className="flex flex-1 flex-col gap-1">
                                    <label
                                        htmlFor={`subcategory-${categoryId}-${subcategory.id}`}
                                        className="text-sm font-medium text-slate-600"
                                    >
                                        Subcategory Name
                                    </label>

                                    <input
                                        id={`subcategory-${categoryId}-${subcategory.id}`}
                                        type="text"
                                        value={subcategory.category_name}
                                        onChange={(
                                            event: ChangeEvent<HTMLInputElement>
                                        ) =>
                                            onChangeSubcategory(
                                                categoryId,
                                                subcategory.id,
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter subcategory name"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]/20"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onRemoveSubcategory(
                                            categoryId,
                                            subcategory.id
                                        )
                                    }
                                    className="cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    Remove
                                </button>
                            </div>

                                                <div className="border-t border-slate-200 pt-3">
                                                    <CollapsibleSection
                                                        title={`Subcategory Menu Items (${sortedItems.length})`}
                                                    >
                                                        {sortedItems.length > 0 && (
                                                            <DndContext
                                                                sensors={sensors}
                                                                collisionDetection={closestCenter}
                                                                onDragEnd={handleItemDragEnd}
                                                            >
                                                                <SortableContext
                                                                    items={sortedItems.map(
                                                                        (item) =>
                                                                            item.id
                                                                    )}
                                                                    strategy={verticalListSortingStrategy}
                                                                >
                                                                    <div className="space-y-3">
                                                                        {sortedItems.map(
                                                                            (item) => (
                                                                                <SortableEntry
                                                                                    key={item.id}
                                                                                    id={item.id}
                                                                                    label={
                                                                                        item.item_name ||
                                                                                        "menu item"
                                                                                    }
                                                                                    className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-4"
                                                                                >
                                                                                    <MenuItemFormFields
                                                                                        item={item}
                                                                                        idPrefix={`subcategory-${categoryId}-${subcategory.id}-item-${item.id}`}
                                                                                        onChange={(field, value) =>
                                                                                            onChangeSubcategoryMenuItem(
                                                                                                categoryId,
                                                                                                subcategory.id,
                                                                                                item.id,
                                                                                                field,
                                                                                                value
                                                                                            )
                                                                                        }
                                                                                        onRemove={() =>
                                                                                            onRemoveSubcategoryMenuItem(
                                                                                                categoryId,
                                                                                                subcategory.id,
                                                                                                item.id
                                                                                            )
                                                                                        }
                                                                                        onImageSelect={(file) =>
                                                                                            onImageSelectSubcategoryMenuItem(
                                                                                                categoryId,
                                                                                                subcategory.id,
                                                                                                item.id,
                                                                                                file
                                                                                            )
                                                                                        }
                                                                                        onDeleteExistingImage={(imageUrl) =>
                                                                                            onDeleteExistingImageSubcategoryMenuItem(
                                                                                                categoryId,
                                                                                                subcategory.id,
                                                                                                item.id,
                                                                                                imageUrl
                                                                                            )
                                                                                        }
                                                                                    />
                                                                                </SortableEntry>
                                                                            )
                                                                        )}
                                                                    </div>
                                                                </SortableContext>
                                                            </DndContext>
                                                        )}
                                                    </CollapsibleSection>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onAddSubcategoryMenuItem(
                                            categoryId,
                                            subcategory.id
                                        )
                                    }
                                    className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-[#6495ED]/50 px-3 py-2 text-sm font-medium text-[#4f7ed4] transition hover:border-[#6495ED] hover:bg-blue-50"
                                >
                                    + Add subcategory item
                                </button>
                                                </div>
                                            </div>
                                        </CollapsibleSection>
                                    </SortableEntry>
                                );
                            })}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <button
                type="button"
                onClick={() => onAddSubcategory(categoryId)}
                className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-[#6495ED]/50 px-3 py-2 text-sm font-medium text-[#4f7ed4] transition hover:border-[#6495ED] hover:bg-blue-50"
            >
                + Add Subcategory
            </button>
        </div>
    );
}
