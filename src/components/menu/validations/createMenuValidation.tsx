
import type { MenuItem, Category } from "../../../types/menu.ts";

export function validateCompleteMenu(
    menuName: string,
    menuItems: MenuItem[],
    categories: Category[]
): string | null {
    if (!menuName.trim()) {
        return "Menu name is required.";
    }

    const validateItems = (
        items: MenuItem[],
        location: string
    ): string | null => {
        for (const item of items) {
            if (!item.item_name.trim()) {
                return `${location}: Item name is required.`;
            }

            const price = Number(item.price);

            if (
                item.price === null ||
                item.price === undefined ||
                String(item.price).trim() === "" ||
                !Number.isFinite(price) ||
                price <= 0
            ) {
                return `${location}: Price should be greater than 0.`;
            }
        }

        return null;
    };

    const validateCategory = (category: Category): string | null => {
        if (!category.category_name.trim()) {
            return "Category name is required.";
        }

        const categoryError = validateItems(
            category.menu_items ?? [],
            `Category "${category.category_name}"`
        );

        if (categoryError) return categoryError;

        for (const subcategory of category.subcategories ?? []) {
            if (!subcategory.category_name.trim()) {
                return `A subcategory name is required in "${category.category_name}".`;
            }

            const subcategoryError = validateItems(
                subcategory.menu_items ?? [],
                `Subcategory "${subcategory.category_name}"`
            );

            if (subcategoryError) return subcategoryError;
        }

        return null;
    };

    const menuItemError = validateItems(menuItems, "Menu items");
    if (menuItemError) return menuItemError;

    for (const category of categories) {
        const categoryError = validateCategory(category);
        if (categoryError) return categoryError;
    }

    return null;
}
