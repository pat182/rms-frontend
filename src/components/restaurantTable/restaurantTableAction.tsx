import { Eye, Pencil, Trash2 } from "lucide-react";
import ActionMenu from "../globals/actionMenu.tsx";
import type {RestaurantTableActionProps } from "../../types/restaurant.ts";


export default function RestaurantTableActions({
    table,
    onViewQr,
    onEdit,
    onDelete
}: RestaurantTableActionProps) {
    return (
        <ActionMenu
            item={table}
            itemLabel={table.table_name}
            actions={[
                { label: "View Qr", icon: Eye, onSelect: onViewQr },
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
