
import MenuActions from '../../components/menu/menuAction.tsx';

import type {Menu} from '../../types/menu.ts';
import  useMenuDefault  from '../../hooks/menu/useMenuDefault.ts';

import {TableLoader} from '../../components/globals/tableLoader.tsx';


export default function Menu() {
    const {
        navigate,
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
            <div className="mb-8 flex flex-col gap-5 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        Menus
                    </h1>

                    <p className="max-w-xl text-sm leading-6 text-slate-500">
                        Manage your restaurant menus and organize your food offerings.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={ () => {navigate('/menu/create')} }
                    className="cursor-pointer self-start rounded-xl bg-[#6495ED] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-md sm:self-auto"
                >
                    + Add Menu
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="border-b border-slate-200 px-6 py-4">ID</th>
                                <th className="border-b border-slate-200 px-6 py-4">Menu Name</th>
                                <th className="border-b border-slate-200 px-6 py-4">Description</th>
                                <th className="border-b border-slate-200 px-6 py-4">Status</th>
                                <th className="border-b border-slate-200 px-6 py-4">Created At</th>
                                <th className="border-b border-slate-200 px-6 py-4">Updated At</th>
                                <th className="border-b border-slate-200 px-6 py-4 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        <TableLoader />
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-red-600"
                                    >
                                        {error}
                                    </td>
                                </tr>
                            ) : menus.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        No menus found.
                                    </td>
                                </tr>
                            ) : (
                                menus.map((menu) => (
                                    <tr key={menu.id} className="transition-colors hover:bg-blue-50/50">
                                        <td className="px-6 py-4 text-xs font-medium text-slate-400">
                                            {menu.id}
                                        </td>

                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {menu.menu_name}
                                        </td>

                                        <td className="max-w-xs truncate px-6 py-4 text-slate-500">
                                            {menu.description || '—'}
                                        </td>

                                        <td className="px-6 py-4">
                                            <button type="button" role="switch" aria-checked={menu.is_active}
                                                aria-label={`Toggle ${menu.menu_name} status`}
                                                onClick={() => handleToggleMenu(menu.id, !menu.is_active,menu.menu_name)}
                                                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2 ${
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

                                            <span className={`ml-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                                menu.is_active
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                {menu.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                                            {menu.created_at
                                                ? new Date(
                                                      menu.created_at
                                                  ).toLocaleDateString()
                                                : '—'}
                                        </td>

                                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
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