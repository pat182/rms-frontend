
import type { ChangeEvent } from "react";
import MenuSubcategories from "./menuSubCategoryForm.tsx";
import MenuItemFormFields from "./menuItemFormFields.tsx";
import CollapsibleSection from "../globals/collapsibleSection.tsx";
import type { CategoryFieldsProps } from "../../types/menu.ts";

export default function CategoryFields({
    categories,
    onAdd,
    onChange,
    onRemove,
    onAddMenuItem,
    onChangeMenuItem,
    onRemoveMenuItem,
    onAddSubcategory,
    onChangeSubcategory,
    onRemoveSubcategory,
    onAddSubcategoryMenuItem,
    onChangeSubcategoryMenuItem,
    onRemoveSubcategoryMenuItem,
    onImageSelectMenuItem,
    onImageSelectSubcategoryMenuItem,
    onDeleteExistingImageMenuItem,
    onDeleteExistingImageSubcategoryMenuItem
}: CategoryFieldsProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-600">
                    Categories
                </h3>
            </div>

            {categories.map((category) => (
                <div key={category.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <CollapsibleSection title={category.category_name || "New Category"}>
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
                                    onAddSubcategoryMenuItem={onAddSubcategoryMenuItem}
                                    onChangeSubcategoryMenuItem={onChangeSubcategoryMenuItem}
                                    onRemoveSubcategoryMenuItem={onRemoveSubcategoryMenuItem}
                                    onImageSelectSubcategoryMenuItem={onImageSelectSubcategoryMenuItem}
                                    onDeleteExistingImageSubcategoryMenuItem={
                                        onDeleteExistingImageSubcategoryMenuItem
                                    }
                                />
                            </div>

                            <div className="border-t border-slate-200 pt-3">
                                <CollapsibleSection title={`Category Menu Items (${category.menu_items.length})`}>
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
                </div>
            ))}

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
