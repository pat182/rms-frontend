
import type { ChangeEvent } from "react";
import type { MenuSubcategoriesProps } from "../../types/menu.ts";
import MenuItemFormFields from "./menuItemFormFields.tsx";
import CollapsibleSection from "../globals/collapsibleSection.tsx";

export default function MenuSubcategories({
    categoryId,
    subcategories,
    onAddSubcategory,
    onChangeSubcategory,
    onRemoveSubcategory,
    onAddSubcategoryMenuItem,
    onChangeSubcategoryMenuItem,
    onRemoveSubcategoryMenuItem,
    onImageSelectSubcategoryMenuItem,
    onDeleteExistingImageSubcategoryMenuItem,
}: MenuSubcategoriesProps) {
    return (
        <div className="space-y-4 pt-4">
            <h4 className="font-medium text-slate-600">
                Subcategories
            </h4>

            {subcategories.map((subcategory) => (
                <div
                    key={subcategory.id}
                    className="rounded-lg bg-slate-50 p-4"
                >
                    <CollapsibleSection
                        title={subcategory.category_name || "New Subcategory"}
                    >
                        <div className="space-y-4">
                            {/* Subcategory Name */}
                            <div className="flex items-end gap-3">
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
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
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
                                    className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Remove
                                </button>
                            </div>

                            {/* Subcategory Menu Items */}
                            <div className="border-t border-slate-200 pt-3">
                                <CollapsibleSection
                                    title={`Subcategory Menu Items (${subcategory.menu_items.length})`}
                                >
                                    <div className="space-y-3">
                                        {subcategory.menu_items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg bg-white p-4"
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
                                            </div>
                                        ))}

                                        {/* {subcategory.menu_items.length === 0 && (
                                            <p className="text-sm text-slate-500">
                                                No items in this subcategory yet.
                                            </p>
                                        )} */}

                                    </div>
                                </CollapsibleSection>
                                <a
                                            href="#"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                onAddSubcategoryMenuItem(
                                                    categoryId,
                                                    subcategory.id
                                                );
                                            }}
                                            className="inline-block cursor-pointer text-sm font-medium text-[#6495ED]"
                                        >
                                            + Add subcategory item
                                </a>
                            </div>
                        </div>
                    </CollapsibleSection>
                </div>
            ))}

            {/* {subcategories.length === 0 && (
                <p className="text-sm text-slate-500">
                    No subcategories yet in this category.
                </p>
            )} */}

            <a
                href="#"
                onClick={(event) => {
                    event.preventDefault();
                    onAddSubcategory(categoryId);
                }}
                className="inline-block cursor-pointer text-sm font-medium text-[#6495ED]"
            >
                + Add Subcategory
            </a>
        </div>
    );
}
