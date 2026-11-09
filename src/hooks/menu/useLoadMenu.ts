
import { useEffect } from "react";

import type { UseLoadMenuParams } from "../../types/menu";
import { getMenuById } from "../../api/menu";

export default function useLoadMenu({
    isEditing,
    menuId,
    setMenuName,
    setDescription,
    setIsActive,
    resetLoadedEntities,
    showToast,
}: UseLoadMenuParams) {
    useEffect(() => {
        if (!isEditing || !menuId) return;

        let cancelled = false;

        const fetchMenu = async () => {
            try {
                const response = await getMenuById(menuId);

                if (!response.ok) {
                    throw new Error("Failed to fetch menu.");
                }

                const result = await response.json();
                const menu = result.data;

                if (cancelled) return;

                setMenuName(menu.menu_name ?? "");
                setDescription(menu.description ?? "");
                setIsActive(menu.is_active ?? true);

                resetLoadedEntities(
                    menu.menu_items ?? [],
                    menu.categories ?? []
                );
            } catch (error) {
                if (!cancelled) {
                    console.error("Failed to load menu:", error);
                    showToast("Failed to load menu.", "error");
                }
            }
        };

        void fetchMenu();

        return () => {
            cancelled = true;
        };
    }, [
        isEditing,
        menuId,
        setMenuName,
        setDescription,
        setIsActive,
        resetLoadedEntities,
        showToast,
    ]);
}
