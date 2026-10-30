
import type { Dispatch, SetStateAction } from "react";

import type {
    MenuItem,
    Category,
    MenuItemUploadResult,
    SavedEntity,
} from "../../types/menu";

import { uploadMenuItemImageApi } from "../../api/menu";
import { getApiErrorMessage } from "../../api/utils";
import { findSavedEntity } from "./menuFormUtils";

type MenuImageUploadsProps = {
    menuItems: MenuItem[];
    categories: Category[];

    menuItemImages: Record<number, File | null>;
    categoryItemImages: Record<number, Record<number, File | null>>;
    subcategoryItemImages: Record<
        number,
        Record<number, Record<number, File | null>>
    >;

    setMenuItems: Dispatch<SetStateAction<MenuItem[]>>;
    setCategories: Dispatch<SetStateAction<Category[]>>;
};

export default function useMenuImageUploads({
    menuItems,
    categories,
    menuItemImages,
    categoryItemImages,
    subcategoryItemImages,
    setMenuItems,
    setCategories,
}: MenuImageUploadsProps) {
    const uploadMenuItemImage = async (
        savedMenuId: number,
        itemId: number,
        file: File,
        itemName: string
    ): Promise<string> => {
        const response = await uploadMenuItemImageApi(
            savedMenuId,
            itemId,
            file
        );

        if (!response.ok) {
            throw new Error(
                `Failed to upload image for "${itemName}": ${
                    await getApiErrorMessage(response)
                }`
            );
        }

        const result: MenuItemUploadResult = await response.json();
        const imageUrl = result.data?.image_url ?? result.image_url;

        if (!imageUrl) {
            throw new Error(
                `Image uploaded for "${itemName}", but the response contained no image_url.`
            );
        }

        return imageUrl;
    };

    const uploadMainMenuItemImages = async (
        savedMenu: SavedEntity
    ) => {
        for (const item of menuItems) {
            const file = menuItemImages[item.id];
            if (!file) continue;

            const savedItem = findSavedEntity(
                savedMenu.menu_items,
                item
            );

            if (!savedItem?.id) {
                throw new Error(
                    `Could not match saved menu item "${item.item_name}" for image upload.`
                );
            }

            const imageUrl = await uploadMenuItemImage(
                savedMenu.id,
                savedItem.id,
                file,
                item.item_name
            );

            setMenuItems((items) =>
                items.map((current) =>
                    current.id === savedItem.id
                        ? { ...current, image_url: imageUrl }
                        : current
                )
            );
        }
    };

    const uploadCategoryMenuItemImages = async (
        savedMenu: SavedEntity
    ) => {
        for (const category of categories) {
            const savedCategory = findSavedEntity(
                savedMenu.categories,
                category
            );

            if (!savedCategory) {
                const hasImages = category.menu_items.some((item) =>
                    Boolean(categoryItemImages[category.id]?.[item.id])
                );

                if (hasImages) {
                    throw new Error(
                        `Could not match saved category "${category.category_name}" for image upload.`
                    );
                }

                continue;
            }

            for (const item of category.menu_items) {
                const file =
                    categoryItemImages[category.id]?.[item.id];

                if (!file) continue;

                const savedItem = findSavedEntity(
                    savedCategory.menu_items,
                    item
                );

                if (!savedItem?.id) {
                    throw new Error(
                        `Could not match saved category item "${item.item_name}" for image upload.`
                    );
                }

                const imageUrl = await uploadMenuItemImage(
                    savedMenu.id,
                    savedItem.id,
                    file,
                    item.item_name
                );

                setCategories((currentCategories) =>
                    currentCategories.map((currentCategory) =>
                        currentCategory.id === savedCategory.id
                            ? {
                                  ...currentCategory,
                                  menu_items:
                                      currentCategory.menu_items.map(
                                          (currentItem) =>
                                              currentItem.id === savedItem.id
                                                  ? {
                                                        ...currentItem,
                                                        image_url: imageUrl,
                                                    }
                                                  : currentItem
                                      ),
                              }
                            : currentCategory
                    )
                );
            }
        }
    };

    const uploadSubcategoryMenuItemImages = async (
        savedMenu: SavedEntity
    ) => {
        for (const category of categories) {
            const savedCategory = findSavedEntity(
                savedMenu.categories,
                category
            );

            if (!savedCategory) {
                const hasImages = category.subcategories.some(
                    (subcategory) =>
                        subcategory.menu_items.some((item) =>
                            Boolean(
                                subcategoryItemImages[category.id]?.[
                                    subcategory.id
                                ]?.[item.id]
                            )
                        )
                );

                if (hasImages) {
                    throw new Error(
                        `Could not match saved category "${category.category_name}" for subcategory image upload.`
                    );
                }

                continue;
            }

            for (const subcategory of category.subcategories) {
                const savedSubcategory = findSavedEntity(
                    savedCategory.subcategories,
                    subcategory
                );

                if (!savedSubcategory) {
                    const hasImages = subcategory.menu_items.some(
                        (item) =>
                            Boolean(
                                subcategoryItemImages[category.id]?.[
                                    subcategory.id
                                ]?.[item.id]
                            )
                    );

                    if (hasImages) {
                        throw new Error(
                            `Could not match saved subcategory "${subcategory.category_name}" for image upload.`
                        );
                    }

                    continue;
                }

                for (const item of subcategory.menu_items) {
                    const file =
                        subcategoryItemImages[category.id]?.[
                            subcategory.id
                        ]?.[item.id];

                    if (!file) continue;

                    const savedItem = findSavedEntity(
                        savedSubcategory.menu_items,
                        item
                    );

                    if (!savedItem?.id) {
                        throw new Error(
                            `Could not match saved subcategory item "${item.item_name}" for image upload.`
                        );
                    }

                    const imageUrl = await uploadMenuItemImage(
                        savedMenu.id,
                        savedItem.id,
                        file,
                        item.item_name
                    );

                    setCategories((currentCategories) =>
                        currentCategories.map((currentCategory) =>
                            currentCategory.id === savedCategory.id
                                ? {
                                      ...currentCategory,
                                      subcategories:
                                          currentCategory.subcategories.map(
                                              (currentSubcategory) =>
                                                  currentSubcategory.id ===
                                                  savedSubcategory.id
                                                      ? {
                                                            ...currentSubcategory,
                                                            menu_items:
                                                                currentSubcategory.menu_items.map(
                                                                    (currentItem) =>
                                                                        currentItem.id ===
                                                                        savedItem.id
                                                                            ? {
                                                                                  ...currentItem,
                                                                                  image_url:
                                                                                      imageUrl,
                                                                              }
                                                                            : currentItem
                                                                ),
                                                        }
                                                      : currentSubcategory
                                          ),
                                  }
                                : currentCategory
                        )
                    );
                }
            }
        }
    };

    const uploadAllMenuItemImages = async (
        savedMenu: SavedEntity
    ) => {
        await uploadMainMenuItemImages(savedMenu);
        await uploadCategoryMenuItemImages(savedMenu);
        await uploadSubcategoryMenuItemImages(savedMenu);
    };

    return {
        uploadAllMenuItemImages,
    };
}
