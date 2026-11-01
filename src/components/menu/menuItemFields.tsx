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
import MenuItemFormFields from "./menuItemFormFields.tsx";
import type { MenuItemFieldsProps } from "../../types/menu.ts";
import CollapsibleSection from "../../components/globals/collapsibleSection";

type SortableMenuItemProps = {
    item: MenuItemFieldsProps["menuItems"][number];
    onChange: MenuItemFieldsProps["onChange"];
    onRemove: MenuItemFieldsProps["onRemove"];
    onImageSelect: MenuItemFieldsProps["onImageSelect"];
    onDeleteExistingImage?: MenuItemFieldsProps["onDeleteExistingImage"];
};

function SortableMenuItem({
    item,
    onChange,
    onRemove,
    onImageSelect,
    onDeleteExistingImage,
}: SortableMenuItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
                isDragging ? "relative z-10 opacity-70 shadow-lg" : ""
            }`}
        >
            <div className="flex items-center gap-2">
                <button
                    ref={setActivatorNodeRef}
                    type="button"
                    aria-label={`Drag ${item.item_name || "menu item"}`}
                    className="touch-none cursor-grab rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical size={20} aria-hidden="true" />
                </button>
                <div className="min-w-0 flex-1">
                    <CollapsibleSection title={item.item_name || "New Menu Item"}>
                        <MenuItemFormFields
                            item={item}
                            idPrefix={`menu-item-${item.id}`}
                            onChange={(field, value) =>
                                onChange(item.id, field, value)
                            }
                            onRemove={() => onRemove(item.id)}
                            onImageSelect={(file) =>
                                onImageSelect(item.id, file)
                            }
                            onDeleteExistingImage={
                                onDeleteExistingImage
                                    ? (imageUrl) =>
                                          onDeleteExistingImage(item.id, imageUrl)
                                    : undefined
                            }
                        />
                    </CollapsibleSection>
                </div>
            </div>
        </div>
    );
}

export default function MenuItemFields({
    menuItems,
    onAdd,
    onChange,
    onRemove,
    onImageSelect,
    onDeleteExistingImage,
}: MenuItemFieldsProps) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );
    const sortedMenuItems = [...menuItems].sort(
        (first, second) => first.sort_order - second.sort_order,
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = sortedMenuItems.findIndex(
            (item) => item.id === active.id,
        );
        const newIndex = sortedMenuItems.findIndex(
            (item) => item.id === over.id,
        );

        if (oldIndex < 0 || newIndex < 0) return;

        arrayMove(sortedMenuItems, oldIndex, newIndex).forEach((item, index) => {
            if (item.sort_order !== index) {
                onChange(item.id, "sort_order", index);
            }
        });
    };

    return (
        <div className="space-y-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-700">
                    Main Menu Items
                </h3>
            </div>

            {sortedMenuItems.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedMenuItems.map((item) => item.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {sortedMenuItems.map((item) => (
                                <SortableMenuItem
                                    key={item.id}
                                    item={item}
                                    onChange={onChange}
                                    onRemove={onRemove}
                                    onImageSelect={onImageSelect}
                                    onDeleteExistingImage={onDeleteExistingImage}
                                />
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
                {menuItems.length === 0 ? "+ Add Menu Item" : "+ Add Item"}
            </button>
        </div>
    );
}
