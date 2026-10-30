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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-600">
                            Main Menu Items
                        </h3>
                    </div>
            {menuItems.length > 0 && (
                <>
                    {menuItems.map((item) => (
                        <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                            <CollapsibleSection title="New Menu Item">
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
                    ))}
                    
                </>
            )}

            <a
                href="#"
                onClick={(event) => {
                    event.preventDefault();
                    onAdd();
                }}
                className="inline-block cursor-pointer text-sm font-medium text-[#6495ED] hover:text-blue-500"
            >
                {menuItems.length === 0 ? "+ Add Menu Item" : "+ Add Item"}
            </a>
        </div>
    );
}