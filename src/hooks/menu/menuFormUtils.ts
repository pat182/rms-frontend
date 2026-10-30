import type {
    MenuItem,
    Category,
    Subcategory,
    CompleteMenuPayload,
    CompleteMenuCategoryPayload,
    CompleteMenuSubcategoryPayload,
    RemovedItems,
    SavedEntity,
} from "../../types/menu";

export const emptyRemovedItems = (): RemovedItems => ({
    menu_item_ids: [],
    category_menu_item_ids: [],
    subcategory_menu_item_ids: [],
    subcategory_ids: [],
    category_ids: [],
});

export const createTempId = (): number =>
    -Date.now() - Math.floor(Math.random() * 1_000_000);

export function normalizeFieldValue(
    field: keyof Omit<MenuItem, "id">,
    value: string | number | boolean | null
) {
    if (field === "price") {
        if (value === "" || value === null) return 0;

        const price = Number(value);
        return Number.isFinite(price) ? price : 0;
    }

    return value;
}

/**
 * Match new entities by client_id.
 * Match existing entities by their database ID.
 */
export function findSavedEntity(
    savedEntities: SavedEntity[] | undefined,
    entity: { id: number; client_id?: string | null }
): SavedEntity | undefined {
    if (!savedEntities) return undefined;

    if (entity.client_id) {
        return savedEntities.find(
            (saved) => saved.client_id === entity.client_id
        );
    }

    return savedEntities.find(
        (saved) => saved.id === entity.id
    );
}

export function buildMenuItemPayload(item: MenuItem) {
    const { id, client_id, image_file, ...rest } = item;
    const isNew = id <= 0;

    return {
        ...rest,
        ...(isNew && client_id ? { client_id } : {}),
        id: isNew ? null : id,
        price: Number(item.price),
    };
}

export function buildSubcategoryPayload(
    subcategory: Subcategory
): CompleteMenuSubcategoryPayload {
    const { id, client_id, ...rest } = subcategory;
    const isNew = id <= 0;

    return {
        ...rest,
        ...(isNew && client_id ? { client_id } : {}),
        id: isNew ? null : id,
        menu_items: subcategory.menu_items.map(buildMenuItemPayload),
    };
}

export function buildCategoryPayload(
    category: Category
): CompleteMenuCategoryPayload {
    const { id, client_id, ...rest } = category;
    const isNew = id <= 0;

    return {
        ...rest,
        ...(isNew && client_id ? { client_id } : {}),
        id: isNew ? null : id,
        menu_items: category.menu_items.map(buildMenuItemPayload),
        subcategories: category.subcategories.map(buildSubcategoryPayload),
    };
}

export function buildMenuPayload(
    menuName: string,
    description: string,
    isActive: boolean,
    menuItems: MenuItem[],
    categories: Category[],
    removedItems: RemovedItems
): CompleteMenuPayload {
    return {
        menu_name: menuName.trim(),
        description: description.trim() || null,
        is_active: isActive,
        menu_items: menuItems.map(buildMenuItemPayload),
        categories: categories.map(buildCategoryPayload),
        removed_items: removedItems,
    };
}
