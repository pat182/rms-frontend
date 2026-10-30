
import MenuActions from '../../components/menu/menuAction.tsx';

import type {Menu} from '../../types/menu.ts';
import  useMenuDefault  from '../../hooks/menu/useMenuDefault.ts';

import {TableLoader} from '../../components/globals/tableLoader.tsx';

export default function Menu() {
    const {
        navigate,
        // showToast,
        menus,
        loading,
        error,
        handleView,
        handleEdit,
        handleDelete,
        handleToggleMenu
    } = useMenuDefault();

    return (
        <main className="p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-600">
                        Menus
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage your restaurant menus.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={ () => {navigate('/menu/create')} }
                    className="cursor-pointer rounded-lg bg-[#6495ED] px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                    + Add Menu
                </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#6495ED] text-xs uppercase text-white">
                            <tr>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Menu Name</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4">Updated At</th>
                                <th className="px-6 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                                        <TableLoader />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-red-600"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            ) : menus.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-10 text-center text-slate-500"
                                    >
                                        No menus found.
                                    </td>
                                </tr>
                            ) : (
                                menus.map((menu) => (
                                    <tr key={menu.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            {menu.id}
                                        </td>

                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            {menu.menu_name}
                                        </td>

                                        <td className="px-6 py-4 text-slate-500">
                                            {menu.description || '—'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <button type="button" role="switch" aria-checked={menu.is_active}
                                                aria-label={`Toggle ${menu.menu_name} status`}
                                                onClick={() => handleToggleMenu(menu.id, !menu.is_active,menu.menu_name)}
                                                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors ${
                                                    menu.is_active
                                                        ? 'bg-[#6495ED]'
                                                        : 'bg-slate-300'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                                        menu.is_active
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>

                                            <span className={`ml-3 text-xs font-medium ${
                                                menu.is_active
                                                    ? 'text-green-700'
                                                    : 'text-slate-500'
                                            }`}>
                                                {menu.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4">
                                            {menu.created_at
                                                ? new Date(
                                                      menu.created_at
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4">
                                            {menu.updated_at
                                                ? new Date(
                                                      menu.updated_at
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <MenuActions
                                                menu={menu}
                                                onView={handleView}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}