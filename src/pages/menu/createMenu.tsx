import MenuItemFields from "../../components/menu/menuItemFields";
import CategoryFields from "../../components/menu/menuCategoryForm";
import useMenuForm  from "../../hooks/menu/useMenuForm";

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

    return (
        <main className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-600">
                    {isEditing ? "Update menu" : "Create menu"}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    {isEditing
                        ? "Edit your restaurant menu"
                        : "Create a new restaurant menu"}
                </p>
            </div>

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