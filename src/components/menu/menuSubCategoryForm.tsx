
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
        <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-700">
                Subcategories
            </h4>

            {subcategories.map((subcategory) => (
                <div
                    key={subcategory.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                    <CollapsibleSection
                        title={subcategory.category_name || "New Subcategory"}
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
                                    title={`Subcategory Menu Items (${subcategory.menu_items.length})`}
                                >
                                    <div className="space-y-3">
                                        {subcategory.menu_items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg border border-slate-200 bg-white p-4"
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

                                    </div>
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
                </div>
            ))}

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
