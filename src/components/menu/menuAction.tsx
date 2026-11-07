import { Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu from "../globals/actionMenu.tsx";
import type { MenuActionsProps } from "../../types/menu.ts";

export default function MenuActions({
    menu,
    onView,
    onEdit,
    onDelete,
}: MenuActionsProps) {
    return (
        <ActionMenu
            item={menu}
            itemLabel={menu.menu_name}
            actions={[
                { label: "View", icon: Eye, onSelect: onView },
                { label: "Edit", icon: Pencil, onSelect: onEdit },
                {
                    label: "Delete",
                    icon: Trash2,
                    onSelect: onDelete,
                    variant: "danger",
                    separatorBefore: true,
                },
            ]}
        />
    );
}
