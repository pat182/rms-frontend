import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type {
    MenuItem,
    Category,
    CompleteMenuPayload,
    SavedEntity,
} from "../../types/menu";

import {createCompleteMenuApi,updateCompleteMenuApi,deleteItemImageApi} from "../../api/menu";

import { getApiErrorMessage } from "../../api/utils";
import { useToast } from "../../components/globals/toastContext";
import { validateCompleteMenu } from "../../components/menu/validations/createMenuValidation";

import {
    buildMenuPayload,
    emptyRemovedItems,
} from "./menuFormUtils";

import useMenuImageUploads from "./useMenuImageUploads";
import useMenuFormEntities from "./useMenuFormEntities";
import useLoadMenu from "./useLoadMenu";

export default function useMenuForm() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { id } = useParams<{ id: string }>();

    const parsedMenuId = id ? Number(id) : null;

    const isEditing =
        parsedMenuId !== null &&
        Number.isInteger(parsedMenuId) &&
        parsedMenuId > 0;

    const menuId = isEditing ? parsedMenuId : null;

    const [menuName, setMenuName] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const {
        menuItems,
        setMenuItems,
        categories,
        setCategories,
        removedItems,
        setRemovedItems,

        menuItemImages,
        // setMenuItemImages,
        categoryItemImages,
        // setCategoryItemImages,
        subcategoryItemImages,
        // setSubcategoryItemImages,

        addMenuItem,
        updateMenuItem,
        removeMenuItem,
        handleMenuItemImageSelect,

        addCategory,
        updateCategory,
        removeCategory,
        reorderCategories,

        addCategoryMenuItem,
        updateCategoryMenuItem,
        removeCategoryMenuItem,
        handleCategoryItemImageSelect,

        addSubcategory,
        updateSubcategory,
        removeSubcategory,
        reorderSubcategories,

        addSubcategoryMenuItem,
        updateSubcategoryMenuItem,
        removeSubcategoryMenuItem,
        reorderSubcategoryMenuItems,
        handleSubcategoryMenuItemImageSelect,
        resetLoadedEntities,

    } = useMenuFormEntities();


    useLoadMenu({
        isEditing,
        menuId,
        setMenuName,
        setDescription,
        setIsActive,
        resetLoadedEntities,
        showToast,
    });

    const { uploadAllMenuItemImages } = useMenuImageUploads({
        menuItems,
        categories,
        menuItemImages,
        categoryItemImages,
        subcategoryItemImages,
        setMenuItems,
        setCategories,
    });
    
    const buildPayload = (): CompleteMenuPayload =>
        buildMenuPayload(
            menuName,
            description,
            isActive,
            menuItems,
            categories,
            removedItems
        );
    const handleDeleteExistingImage = async (
        itemId: number,
        imageUrl: string
    ): Promise<void> => {
        if (!menuId || itemId <= 0 || !imageUrl) {
            throw new Error("Cannot delete this image.");
        }

        const response = await deleteItemImageApi(
            menuId,
            itemId,
            imageUrl
        );

        if (!response.ok) {
            throw new Error(
                await getApiErrorMessage(response)
            );
        }
    };
    const handleSave = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (isSaving) return;

        const validationError = validateCompleteMenu(
            menuName,
            menuItems,
            categories
        );

        if (validationError) {
            showToast(validationError, "error");
            return;
        }

        setIsSaving(true);

        try {
            const payload = buildPayload();

            console.log("MENU PAYLOAD:", payload);

            const response = isEditing
                ? await updateCompleteMenuApi(menuId!, payload)
                : await createCompleteMenuApi(payload);

            if (!response.ok) {
                throw new Error(await getApiErrorMessage(response));
            }

            const result = await response.json();
            const savedMenu: SavedEntity | undefined = result.data;

            if (!savedMenu) {
                throw new Error("The server returned no saved menu.");
            }

            console.log("SAVED MENU:", savedMenu);

            // Preserve the original selected image files before updating state.
            const selectedMenuItemImages = { ...menuItemImages };
            const selectedCategoryItemImages = { ...categoryItemImages };
            const selectedSubcategoryItemImages = {
                ...subcategoryItemImages,
            };

            setMenuItems((savedMenu.menu_items ?? []) as MenuItem[]);
            setCategories(
                ((savedMenu.categories ?? []) as Category[]).map(
                    (category, sort_order) => ({
                        ...category,
                        sort_order: category.sort_order ?? sort_order,
                        subcategories: (category.subcategories ?? []).map(
                            (subcategory, subcategorySortOrder) => ({
                                ...subcategory,
                                sort_order:
                                    subcategory.sort_order ??
                                    subcategorySortOrder,
                                menu_items: (subcategory.menu_items ?? []).map(
                                    (item, itemSortOrder) => ({
                                        ...item,
                                        sort_order:
                                            item.sort_order ?? itemSortOrder,
                                    })
                                ),
                            })
                        ),
                    })
                )
            );
            setRemovedItems(emptyRemovedItems());

            const hasImages =
                Object.values(selectedMenuItemImages).some(Boolean) ||
                Object.values(selectedCategoryItemImages).some((items) =>
                    Object.values(items).some(Boolean)
                ) ||
                Object.values(selectedSubcategoryItemImages).some(
                    (subcategories) =>
                        Object.values(subcategories).some((items) =>
                            Object.values(items).some(Boolean)
                        )
                );

            if (hasImages) {
                try {
                    // await uploadMainMenuItemImages(savedMenu);
                    // await uploadCategoryMenuItemImages(savedMenu);
                    // await uploadSubcategoryMenuItemImages(savedMenu);
                    await uploadAllMenuItemImages(savedMenu);
                    showToast(
                        isEditing
                            ? "Menu updated successfully."
                            : "Menu created successfully.",
                        "success"
                    );
                } catch (error) {
                    console.error("Image upload failed:", error);

                    const message =
                        error instanceof Error
                            ? error.message
                            : "Unknown image upload error.";

                    showToast(
                        `Menu saved, but image upload failed: ${message}`,
                        "error"
                    );
                }
            } else {
                showToast(
                    isEditing
                        ? "Menu updated successfully."
                        : "Menu created successfully.",
                    "success"
                );
            }

            if (!isEditing && savedMenu.id) {
                navigate(`/menu/edit/${savedMenu.id}`);
            }
        } catch (error) {
            console.error("Failed to save menu:", error);

            const message =
                error instanceof Error
                    ? error.message
                    : "An unexpected error occurred.";

            showToast(message, "error");
        } finally {
            setIsSaving(false);
        }
    };

    return {
        menuName,
        setMenuName,
        description,
        setDescription,
        isActive,
        setIsActive,
        isSaving,
        isEditing,

        menuItems,
        categories,
        removedItems,

        menuItemImages,
        categoryItemImages,
        subcategoryItemImages,

        handleSave,

        addMenuItem,
        updateMenuItem,
        removeMenuItem,

        addCategory,
        updateCategory,
        removeCategory,
        reorderCategories,

        addCategoryMenuItem,
        updateCategoryMenuItem,
        removeCategoryMenuItem,

        addSubcategory,
        updateSubcategory,
        removeSubcategory,
        reorderSubcategories,
        addSubcategoryMenuItem,
        updateSubcategoryMenuItem,
        removeSubcategoryMenuItem,
        reorderSubcategoryMenuItems,

        handleMenuItemImageSelect,
        handleCategoryItemImageSelect,
        handleSubcategoryMenuItemImageSelect,
        handleDeleteExistingImage,
    };
}