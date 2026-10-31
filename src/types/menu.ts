
export type Menu = {
    id: number;
    menu_name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type MenuActionsProps = {
    menu: Menu;
    onView: (menu: Menu) => void;
    onEdit: (menu: Menu) => void;
    onDelete: (menu: Menu) => void;
};

export type MenuItem = {
    id: number;
    client_id: string;
    item_name: string;
    description: string;
    price: number;
    image_url: string | null;
    image_file?: File | null;
    is_available: boolean;
    sort_order: number;
};

export type Subcategory = {
    id: number;
    client_id: string;
    category_name: string;
    menu_items: MenuItem[];
};

export type Category = {
    id: number;
    client_id: string;
    category_name: string;
    menu_items: MenuItem[];
    subcategories: Subcategory[];
};

export type CompleteMenuItemPayload = Omit<
    MenuItem,
    "id" | "client_id" | "image_file"
> & {
    id: number | null;
    client_id?: string;
};

export type CompleteMenuSubcategoryPayload = Omit<
    Subcategory,
    "id" | "client_id" | "menu_items"
> & {
    id: number | null;
    client_id?: string;
    menu_items: CompleteMenuItemPayload[];
};

export type CompleteMenuCategoryPayload = Omit<
    Category,
    "id" | "client_id" | "menu_items" | "subcategories"
> & {
    id: number | null;
    client_id?: string;
    menu_items: CompleteMenuItemPayload[];
    subcategories: CompleteMenuSubcategoryPayload[];
};

export type RemovedItemsPayload = {
    menu_item_ids: number[];
    category_menu_item_ids: number[];
    subcategory_menu_item_ids: number[];
    subcategory_ids: number[];
    category_ids: number[];
};

export type CompleteMenuPayload = {
    menu_name: string;
    description: string | null;
    is_active: boolean;
    categories: CompleteMenuCategoryPayload[];
    menu_items: CompleteMenuItemPayload[];
    removed_items: RemovedItemsPayload;
};

export type CategoryFieldsProps = {
    categories: Category[];
    onAdd: () => void;
    onChange: (id: number, category_name: string) => void;
    onRemove: (id: number) => void;

    onAddMenuItem: (categoryId: number) => void;

    onChangeMenuItem: (
        categoryId: number,
        itemId: number,
        field: keyof Omit<MenuItem, "id">,
        value: string | number | boolean | null
    ) => void;

    onRemoveMenuItem: (categoryId: number, itemId: number) => void;

    onAddSubcategory: (categoryId: number) => void;

    onChangeSubcategory: (
        categoryId: number,
        subcategoryId: number,
        category_name: string
    ) => void;

    onRemoveSubcategory: (
        categoryId: number,
        subcategoryId: number
    ) => void;

    onAddSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number
    ) => void;

    onChangeSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number,
        itemId: number,
        field: keyof Omit<MenuItem, "id">,
        value: string | number | boolean | null
    ) => void;

    onRemoveSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number,
        itemId: number
    ) => void;

    onImageSelectMenuItem: (
        categoryId: number,
        itemId: number,
        file: File | null
    ) => void;

    onImageSelectSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number,
        itemId: number,
        file: File | null
    ) => void;
    onDeleteExistingImageMenuItem: (
        categoryId: number,
        itemId: number,
        imageUrl: string
    ) => Promise<void>;
    onDeleteExistingImageSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number,
        itemId: number,
        imageUrl: string
    ) => Promise<void>;
};

export type MenuSubcategoriesProps = {
    categoryId: number;
    subcategories: Subcategory[];

    onAddSubcategory: (categoryId: number) => void;

    onChangeSubcategory: (
        categoryId: number,
        subcategoryId: number,
        value: string
    ) => void;

    onRemoveSubcategory: (
        categoryId: number,
        subcategoryId: number
    ) => void;

    onAddSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number
    ) => void;

    onChangeSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number,
        itemId: number,
        field: keyof Omit<MenuItem, "id">,
        value: string | number | boolean | null
    ) => void;

    onRemoveSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number,
        itemId: number
    ) => void;

    onImageSelectSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number,
        itemId: number,
        file: File | null
    ) => void;
    onDeleteExistingImageSubcategoryMenuItem: (
        categoryId: number,
        subcategoryId: number,
        itemId: number,
        imageUrl: string
    ) => Promise<void>;
};

export type MenuItemFormFieldsProps = {
    item: MenuItem;
    idPrefix: string;

    onChange: (
        field: keyof Omit<MenuItem, "id">,
        value: string | number | boolean | null
    ) => void;

    onRemove: () => void;

    onImageSelect: (file: File | null) => void;

    onDeleteExistingImage?: (imageUrl: string) => Promise<void>;
};

export type MenuItemFieldsProps = {
    menuItems: MenuItem[];
    onAdd: () => void;

    onChange: (
        id: number,
        field: keyof Omit<MenuItem, "id">,
        value: string | number | boolean | null
    ) => void;

    onRemove: (id: number) => void;

    onImageSelect: (
        itemId: MenuItem["id"],
        file: File | null
    ) => void;

    onDeleteExistingImage?: (
        itemId: number,
        imageUrl: string
    ) => Promise<void>;
};

export type MenuItemUploadResult = {
    data?: {
        image_url?: string | null;
    };
    image_url?: string | null;
};

export type SavedEntity = {
    id: number;
    client_id?: string;
    menu_items?: SavedEntity[];
    categories?: SavedEntity[];
    subcategories?: SavedEntity[];
};

export type RemovedItems = {
    menu_item_ids: number[];
    category_menu_item_ids: number[];
    subcategory_menu_item_ids: number[];
    subcategory_ids: number[];
    category_ids: number[];
};

