
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
                <div key={category.id} className="rounded-xl bg-slate-50 p-4">
                    <CollapsibleSection title={category.category_name || "New Category"}>
                        <div className="space-y-4">
                            {/* Category Name */}
                            <div className="flex items-end gap-3">
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
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onRemove(category.id)}
                                    className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    Remove
                                </button>
                            </div>

                            {/* Subcategories */}
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

                            {/* Category Menu Items */}
                            <div className="border-t border-slate-200 pt-3">
                                <CollapsibleSection title={`Category Menu Items (${category.menu_items.length})`}>
                                    <div className="space-y-4">
                                        {category.menu_items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-lg bg-slate-50 p-3"
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

                                        {/* {category.menu_items.length === 0 && (
                                            <p className="text-sm text-slate-500">
                                                No items in this category yet.
                                            </p>
                                        )} */}

                                        
                                    </div>
                                </CollapsibleSection>
                                <a href="#"
                                            onClick={(event) => {
                                                event.preventDefault();
                                                onAddMenuItem(category.id);
                                            }}
                                            className="inline-block cursor-pointer text-sm font-medium text-[#6495ED]"
                                        >
                                            + Add category item
                                </a>
                            </div>
                            
                        </div>
                    </CollapsibleSection>
                </div>
            ))}

            {/* {categories.length === 0 && (
                <p className="text-sm text-slate-500">
                    No categories added yet.
                </p>
            )} */}

            <a
                href="#"
                onClick={(event) => {
                    event.preventDefault();
                    onAdd();
                }}
                className="inline-block cursor-pointer text-sm font-medium text-[#6495ED]"
            >
                + Add Category
            </a>
        </div>
    );
}
