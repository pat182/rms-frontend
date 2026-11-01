import MenuItemFormFields from "./menuItemFormFields.tsx";
import type { MenuItemFieldsProps } from "../../types/menu.ts";
import CollapsibleSection from "../../components/globals/collapsibleSection";

export default function MenuItemFields({
    menuItems,
    onAdd,
    onChange,
    onRemove,
    onImageSelect,
    onDeleteExistingImage,
}: MenuItemFieldsProps) {
    return (
        <div className="space-y-4 border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-700">
                    Main Menu Items
                </h3>
            </div>
            {menuItems.length > 0 && (
                menuItems.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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
                                        ? (imageUrl) => onDeleteExistingImage(item.id, imageUrl)
                                        : undefined
                                }
                            />
                        </CollapsibleSection>
                    </div>
                ))
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