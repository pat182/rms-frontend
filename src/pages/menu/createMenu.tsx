import MenuItemFields from "../../components/menu/menuItemFields";
import CategoryFields from "../../components/menu/menuCategoryForm";
import { TableLoader } from "../../components/globals/tableLoader";
import useMenuForm  from "../../hooks/menu/useMenuForm";
import { Utensils } from "lucide-react";

export default function CreateMenu() {
    
    const {
        isEditing,
        menuName,
        setMenuName,
        description,
        setDescription,
        isActive,
        setIsActive,
        isSaving,
        isLoadingMenu,
        menuItems,
        categories,
        handleSave,
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
        handleDeleteExistingImage
    } = useMenuForm();

    if (isLoadingMenu) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center p-6">
                <TableLoader />
            </main>
        );
    }

    return (
        <main className="p-6">
            <header className="relative mb-7 overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-blue-100/60 blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-24 right-1/3 h-48 w-48 rounded-full bg-indigo-100/40 blur-3xl"
                />

                <div className="relative">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        <Utensils size={14} />
                        Menu Management
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        {isEditing ? "Update Menu" : "Create Menu"}
                    </h1>

                    <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
                        {isEditing
                            ? "Update your menu details, organize categories, and manage your menu items."
                            : "Set up a new restaurant menu, organize your categories, and add your menu items."}
                    </p>
                </div>
            </header>

            <form onSubmit={handleSave} noValidate className="space-y-6">
                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="text-lg font-semibold text-slate-600">
                        Menu Details
                    </h2>

                    <div>
                        <label htmlFor="menuName"
                            className="mb-1 block text-sm font-medium text-slate-600">
                            Menu Name
                        </label>

                        <input
                            id="menuName"
                            value={menuName}
                            onChange={(e) => setMenuName(e.target.value)}
                            required
                            placeholder="e.g. Main Menu"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                        />
                    </div>

                    <div>
                        <label htmlFor="description"
                            className="mb-1 block text-sm font-medium text-slate-600">
                            Description
                        </label>

                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Describe this menu"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]"
                        />
                    </div>

                    <label className="cursor-pointer flex items-center gap-3 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className=" peer sr-only"
                        />
                        <span className="relative h-6 w-11 rounded-full bg-slate-300 transition-colors peer-checked:bg-[#6495ED] after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5" />
                        Active menu
                    </label>

                    <CategoryFields
                        categories={categories}
                        onAdd={addCategory}
                        onChange={updateCategory}
                        onRemove={removeCategory}
                        onReorder={reorderCategories}
                        onAddMenuItem={addCategoryMenuItem}
                        onChangeMenuItem={updateCategoryMenuItem}
                        onRemoveMenuItem={removeCategoryMenuItem}
                        onAddSubcategory={addSubcategory}
                        onChangeSubcategory={updateSubcategory}
                        onRemoveSubcategory={removeSubcategory}
                        onReorderSubcategories={reorderSubcategories}
                        onAddSubcategoryMenuItem={addSubcategoryMenuItem}
                        onChangeSubcategoryMenuItem={updateSubcategoryMenuItem}
                        onRemoveSubcategoryMenuItem={removeSubcategoryMenuItem}
                        onReorderSubcategoryMenuItems={reorderSubcategoryMenuItems}
                        onImageSelectMenuItem={handleCategoryItemImageSelect}
                        onImageSelectSubcategoryMenuItem={handleSubcategoryMenuItemImageSelect}
                        onDeleteExistingImageMenuItem={(_categoryId, itemId, imageUrl) =>
                            handleDeleteExistingImage(itemId, imageUrl)
                        }
                        onDeleteExistingImageSubcategoryMenuItem={(
                            _categoryId,
                            _subcategoryId,
                            itemId,
                            imageUrl
                        ) => handleDeleteExistingImage(itemId, imageUrl)}
                    />
                    {/* <CollapsibleSection title="Menu Items"> */}
                        <MenuItemFields
                            menuItems={menuItems}
                            onAdd={addMenuItem}
                            onChange={updateMenuItem}
                            onRemove={removeMenuItem}
                            onImageSelect={handleMenuItemImageSelect}
                            onDeleteExistingImage={handleDeleteExistingImage}
                        />
                    {/* </CollapsibleSection> */}
                </section>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        aria-busy={isSaving}
                        className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-[#6495ED] px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSaving && (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        )}

                        {isSaving
                            ? "Saving..."
                            : isEditing
                                ? "Save Changes"
                                : "Create Menu"}
                    </button>
                </div>
            </form>
        </main>
    );
}