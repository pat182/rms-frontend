import { useCallback, useState } from "react";
import type { MenuItem, Category, RemovedItems } from "../../types/menu";
import {
    createTempId,
    emptyRemovedItems,
    normalizeFieldValue,
} from "./menuFormUtils";

type UseMenuFormEntitiesParams = {
    initialRemovedItems?: RemovedItems;
};

export default function useMenuFormEntities({
    initialRemovedItems = emptyRemovedItems(),
}: UseMenuFormEntitiesParams = {}) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [removedItems, setRemovedItems] =
        useState<RemovedItems>(initialRemovedItems);

    const [menuItemImages, setMenuItemImages] = useState<
        Record<number, File | null>
    >({});

    const [categoryItemImages, setCategoryItemImages] = useState<
        Record<number, Record<number, File | null>>
    >({});

    const [subcategoryItemImages, setSubcategoryItemImages] = useState<
        Record<number, Record<number, Record<number, File | null>>>
    >({});

    const trackRemovedId = (
        key: keyof RemovedItems,
        entityId: number
    ) => {
        if (entityId <= 0) return;

        setRemovedItems((previous) => ({
            ...previous,
            [key]: previous[key].includes(entityId)
                ? previous[key]
                : [...previous[key], entityId],
        }));
    };

    // Root menu items
    const addMenuItem = () => {
        setMenuItems((items) => [
            ...items,
            {
                id: createTempId(),
                client_id: crypto.randomUUID(),
                item_name: "",
                description: "",
                price: 0,
                image_url: null,
                is_available: true,
                sort_order: items.length,
            },
        ]);
    };

    const updateMenuItem = (
        itemId: number,
        field: keyof Omit<MenuItem, "id">,
        value: string | number | boolean | null
    ) => {
        const normalizedValue = normalizeFieldValue(field, value);

        setMenuItems((items) =>
            items.map((item) =>
                item.id === itemId
                    ? { ...item, [field]: normalizedValue }
                    : item
            )
        );
    };

    const removeMenuItem = (itemId: number) => {
        trackRemovedId("menu_item_ids", itemId);

        setMenuItems((items) =>
            items.filter((item) => item.id !== itemId)
        );

        setMenuItemImages((images) => {
            const updated = { ...images };
            delete updated[itemId];
            return updated;
        });
    };

    const handleMenuItemImageSelect = (
        itemId: number,
        file: File | null
    ) => {
        setMenuItemImages((images) => ({
            ...images,
            [itemId]: file,
        }));
    };

    // Categories
    const addCategory = () => {
        setCategories((items) => [
            ...items,
            {
                id: createTempId(),
                client_id: crypto.randomUUID(),
                category_name: "",
                menu_items: [],
                subcategories: [],
            },
        ]);
    };

    const updateCategory = (
        categoryId: number,
        category_name: string
    ) => {
        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? { ...category, category_name }
                    : category
            )
        );
    };

    const removeCategory = (categoryId: number) => {
        const category = categories.find(
            (item) => item.id === categoryId
        );

        if (category) {
            trackRemovedId("category_ids", category.id);

            category.menu_items.forEach((item) => {
                trackRemovedId("category_menu_item_ids", item.id);
            });

            category.subcategories.forEach((subcategory) => {
                trackRemovedId("subcategory_ids", subcategory.id);

                subcategory.menu_items.forEach((item) => {
                    trackRemovedId("subcategory_menu_item_ids", item.id);
                });
            });
        }

        setCategories((items) =>
            items.filter((category) => category.id !== categoryId)
        );

        setCategoryItemImages((images) => {
            const updated = { ...images };
            delete updated[categoryId];
            return updated;
        });

        setSubcategoryItemImages((images) => {
            const updated = { ...images };
            delete updated[categoryId];
            return updated;
        });
    };

    // Category menu items
    const addCategoryMenuItem = (categoryId: number) => {
        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          menu_items: [
                              ...category.menu_items,
                              {
                                  id: createTempId(),
                                  client_id: crypto.randomUUID(),
                                  item_name: "",
                                  description: "",
                                  price: 0,
                                  image_url: null,
                                  is_available: true,
                                  sort_order: category.menu_items.length,
                              },
                          ],
                      }
                    : category
            )
        );
    };

    const updateCategoryMenuItem = (
        categoryId: number,
        itemId: number,
        field: keyof Omit<MenuItem, "id">,
        value: string | number | boolean | null
    ) => {
        const normalizedValue = normalizeFieldValue(field, value);

        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          menu_items: category.menu_items.map((item) =>
                              item.id === itemId
                                  ? { ...item, [field]: normalizedValue }
                                  : item
                          ),
                      }
                    : category
            )
        );
    };

    const removeCategoryMenuItem = (
        categoryId: number,
        itemId: number
    ) => {
        trackRemovedId("category_menu_item_ids", itemId);

        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          menu_items: category.menu_items.filter(
                              (item) => item.id !== itemId
                          ),
                      }
                    : category
            )
        );

        setCategoryItemImages((images) => {
            const updated = { ...images };
            const categoryImages = { ...updated[categoryId] };

            delete categoryImages[itemId];

            updated[categoryId] = categoryImages;
            return updated;
        });
    };

    const handleCategoryItemImageSelect = (
        categoryId: number,
        itemId: number,
        file: File | null
    ) => {
        setCategoryItemImages((images) => ({
            ...images,
            [categoryId]: {
                ...images[categoryId],
                [itemId]: file,
            },
        }));
    };

    // Subcategories
    const addSubcategory = (categoryId: number) => {
        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          subcategories: [
                              ...category.subcategories,
                              {
                                  id: createTempId(),
                                  client_id: crypto.randomUUID(),
                                  category_name: "",
                                  menu_items: [],
                              },
                          ],
                      }
                    : category
            )
        );
    };

    const updateSubcategory = (
        categoryId: number,
        subcategoryId: number,
        category_name: string
    ) => {
        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          subcategories: category.subcategories.map(
                              (subcategory) =>
                                  subcategory.id === subcategoryId
                                      ? { ...subcategory, category_name }
                                      : subcategory
                          ),
                      }
                    : category
            )
        );
    };

    const removeSubcategory = (
        categoryId: number,
        subcategoryId: number
    ) => {
        const category = categories.find(
            (item) => item.id === categoryId
        );

        const subcategory = category?.subcategories.find(
            (item) => item.id === subcategoryId
        );

        if (subcategory) {
            trackRemovedId("subcategory_ids", subcategory.id);

            subcategory.menu_items.forEach((item) => {
                trackRemovedId("subcategory_menu_item_ids", item.id);
            });
        }

        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          subcategories: category.subcategories.filter(
                              (subcategory) =>
                                  subcategory.id !== subcategoryId
                          ),
                      }
                    : category
            )
        );

        setSubcategoryItemImages((images) => {
            const updated = { ...images };
            const categoryImages = { ...updated[categoryId] };

            delete categoryImages[subcategoryId];

            updated[categoryId] = categoryImages;
            return updated;
        });
    };

    // Subcategory menu items
    const addSubcategoryMenuItem = (
        categoryId: number,
        subcategoryId: number
    ) => {
        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          subcategories: category.subcategories.map(
                              (subcategory) =>
                                  subcategory.id === subcategoryId
                                      ? {
                                            ...subcategory,
                                            menu_items: [
                                                ...subcategory.menu_items,
                                                {
                                                    id: createTempId(),
                                                    client_id: crypto.randomUUID(),
                                                    item_name: "",
                                                    description: "",
                                                    price: 0,
                                                    image_url: null,
                                                    is_available: true,
                                                    sort_order:
                                                        subcategory.menu_items.length,
                                                },
                                            ],
                                        }
                                      : subcategory
                          ),
                      }
                    : category
            )
        );
    };

    const updateSubcategoryMenuItem = (
        categoryId: number,
        subcategoryId: number,
        itemId: number,
        field: keyof Omit<MenuItem, "id">,
        value: string | number | boolean | null
    ) => {
        const normalizedValue = normalizeFieldValue(field, value);

        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          subcategories: category.subcategories.map(
                              (subcategory) =>
                                  subcategory.id === subcategoryId
                                      ? {
                                            ...subcategory,
                                            menu_items:
                                                subcategory.menu_items.map(
                                                    (item) =>
                                                        item.id === itemId
                                                            ? {
                                                                  ...item,
                                                                  [field]: normalizedValue,
                                                              }
                                                            : item
                                                ),
                                        }
                                      : subcategory
                          ),
                      }
                    : category
            )
        );
    };

    const removeSubcategoryMenuItem = (
        categoryId: number,
        subcategoryId: number,
        itemId: number
    ) => {
        trackRemovedId("subcategory_menu_item_ids", itemId);

        setCategories((items) =>
            items.map((category) =>
                category.id === categoryId
                    ? {
                          ...category,
                          subcategories: category.subcategories.map(
                              (subcategory) =>
                                  subcategory.id === subcategoryId
                                      ? {
                                            ...subcategory,
                                            menu_items:
                                                subcategory.menu_items.filter(
                                                    (item) => item.id !== itemId
                                                ),
                                        }
                                      : subcategory
                          ),
                      }
                    : category
            )
        );

        setSubcategoryItemImages((images) => {
            const updated = { ...images };
            const categoryImages = { ...updated[categoryId] };
            const subcategoryImages = {
                ...categoryImages[subcategoryId],
            };

            delete subcategoryImages[itemId];

            categoryImages[subcategoryId] = subcategoryImages;
            updated[categoryId] = categoryImages;

            return updated;
        });
    };

    const handleSubcategoryMenuItemImageSelect = (
        categoryId: number,
        subcategoryId: number,
        itemId: number,
        file: File | null
    ) => {
        setSubcategoryItemImages((images) => ({
            ...images,
            [categoryId]: {
                ...images[categoryId],
                [subcategoryId]: {
                    ...images[categoryId]?.[subcategoryId],
                    [itemId]: file,
                },
            },
        }));
    };

    const resetLoadedEntities = useCallback(
        (
            loadedMenuItems: MenuItem[],
            loadedCategories: Category[]
        ) => {
            setMenuItems(loadedMenuItems);
            setCategories(loadedCategories);
            setRemovedItems(emptyRemovedItems());
            setMenuItemImages({});
            setCategoryItemImages({});
            setSubcategoryItemImages({});
        },
        []
    );

    return {
        menuItems,
        setMenuItems,
        categories,
        setCategories,
        removedItems,
        setRemovedItems,
        menuItemImages,
        setMenuItemImages,
        categoryItemImages,
        setCategoryItemImages,
        subcategoryItemImages,
        setSubcategoryItemImages,
        trackRemovedId,
        resetLoadedEntities,
        addMenuItem,
        updateMenuItem,
        removeMenuItem,
        handleMenuItemImageSelect,
        addCategory,
        updateCategory,
        removeCategory,
        addCategoryMenuItem,
        updateCategoryMenuItem,
        removeCategoryMenuItem,
        handleCategoryItemImageSelect,
        addSubcategory,
        updateSubcategory,
        removeSubcategory,
        addSubcategoryMenuItem,
        updateSubcategoryMenuItem,
        removeSubcategoryMenuItem,
        handleSubcategoryMenuItemImageSelect,
    };
}
