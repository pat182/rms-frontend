
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
import MenuSubcategories from "./menuSubCategoryForm.tsx";
import MenuItemFormFields from "./menuItemFormFields.tsx";
import CollapsibleSection from "../globals/collapsibleSection.tsx";
import type { Category, CategoryFieldsProps } from "../../types/menu.ts";

type SortableCategoryProps = {
    category: Category;
    children: ReactNode;
};

function SortableCategory({ category, children }: SortableCategoryProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: category.id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={`flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
                isDragging ? "relative z-10 opacity-70 shadow-lg" : ""
            }`}
        >
            <button
                ref={setActivatorNodeRef}
                type="button"
                aria-label={`Drag ${category.category_name || "category"}`}
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

export default function CategoryFields({
    categories,
    onAdd,
    onChange,
    onRemove,
    onReorder,
    onAddMenuItem,
    onChangeMenuItem,
    onRemoveMenuItem,
    onAddSubcategory,
    onChangeSubcategory,
    onRemoveSubcategory,
    onReorderSubcategories,
    onAddSubcategoryMenuItem,
    onChangeSubcategoryMenuItem,
    onRemoveSubcategoryMenuItem,
    onReorderSubcategoryMenuItems,
    onImageSelectMenuItem,
    onImageSelectSubcategoryMenuItem,
    onDeleteExistingImageMenuItem,
    onDeleteExistingImageSubcategoryMenuItem
}: CategoryFieldsProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );
    const sortedCategories = [...categories].sort(
        (first, second) => first.sort_order - second.sort_order,
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = sortedCategories.findIndex(
            (category) => category.id === active.id,
        );
        const newIndex = sortedCategories.findIndex(
            (category) => category.id === over.id,
        );
        if (oldIndex < 0 || newIndex < 0) return;

        onReorder(
            arrayMove(sortedCategories, oldIndex, newIndex).map(
                (category) => category.id,
            ),
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-600">
                    Categories
                </h3>
            </div>

            {sortedCategories.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedCategories.map((category) => category.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {sortedCategories.map((category) => (
                                <SortableCategory
                                    key={category.id}
                                    category={category}
                                >
                                    <CollapsibleSection
                                        title={category.category_name || "New Category"}
                                    >
                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                                <div className="flex flex-1 flex-col gap-1">
                                                    <label
                                                        htmlFor={`category-name-${category.id}`}
                                                        className="text-sm font-medium text-slate-600"
                                                    >
                                                        Category Name
                                                    </label>

                                                    <input
                                                        id={`category-name-${category.id}`}
                                                        type="text"
                                                        value={category.category_name}
                                                        onChange={(
                                                            event: ChangeEvent<HTMLInputElement>
                                                        ) =>
                                                            onChange(
                                                                category.id,
                                                                event.target.value
                                                            )
                                                        }
                                                        placeholder="Enter category name"
                                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]/20"
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => onRemove(category.id)}
                                                    className="cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            <div className="border-t border-slate-200 pt-4">
                                                <MenuSubcategories
                                                    categoryId={category.id}
                                                    subcategories={category.subcategories}
                                                    onAddSubcategory={onAddSubcategory}
                                                    onChangeSubcategory={onChangeSubcategory}
                                                    onRemoveSubcategory={onRemoveSubcategory}
                                                    onReorderSubcategories={onReorderSubcategories}
                                                    onAddSubcategoryMenuItem={onAddSubcategoryMenuItem}
                                                    onChangeSubcategoryMenuItem={onChangeSubcategoryMenuItem}
                                                    onRemoveSubcategoryMenuItem={onRemoveSubcategoryMenuItem}
                                                    onReorderSubcategoryMenuItems={onReorderSubcategoryMenuItems}
                                                    onImageSelectSubcategoryMenuItem={onImageSelectSubcategoryMenuItem}
                                                    onDeleteExistingImageSubcategoryMenuItem={
                                                        onDeleteExistingImageSubcategoryMenuItem
                                                    }
                                                />
                                            </div>

                                            <div className="border-t border-slate-200 pt-3">
                                                <CollapsibleSection
                                                    title={`Category Menu Items (${category.menu_items.length})`}
                                                >
                                                    <div className="space-y-4">
                                                        {category.menu_items.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                                                            >
                                                                <MenuItemFormFields
                                                                    item={item}
                                                                    idPrefix={`category-${category.id}-item-${item.id}`}
                                                                    onChange={(field, value) =>
                                                                        onChangeMenuItem(
                                                                            category.id,
                                                                            item.id,
                                                                            field,
                                                                            value
                                                                        )
                                                                    }
                                                                    onRemove={() =>
                                                                        onRemoveMenuItem(
                                                                            category.id,
                                                                            item.id
                                                                        )
                                                                    }
                                                                    onImageSelect={(file) =>
                                                                        onImageSelectMenuItem(
                                                                            category.id,
                                                                            item.id,
                                                                            file
                                                                        )
                                                                    }
                                                                    onDeleteExistingImage={(imageUrl) =>
                                                                        onDeleteExistingImageMenuItem(
                                                                            category.id,
                                                                            item.id,
                                                                            imageUrl
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CollapsibleSection>
                                                <button
                                                    type="button"
                                                    onClick={() => onAddMenuItem(category.id)}
                                                    className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-[#6495ED]/50 px-3 py-2 text-sm font-medium text-[#4f7ed4] transition hover:border-[#6495ED] hover:bg-blue-50"
                                                >
                                                    + Add category item
                                                </button>
                                            </div>
                                        </div>
                                    </CollapsibleSection>
                                </SortableCategory>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <button
                type="button"
                onClick={onAdd}
                className="inline-flex cursor-pointer items-center rounded-lg border border-dashed border-[#6495ED]/50 px-3 py-2 text-sm font-medium text-[#4f7ed4] transition hover:border-[#6495ED] hover:bg-blue-50"
            >
                + Add Category
            </button>
        </div>
    );
}
