import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { useToast } from "../../components/globals/toastContext.tsx";
import { Menu } from '../../types/menu.ts';
import { getMenus,updateMenuStatusApi } from '../../api/menu.ts';
import { getApiErrorMessage } from '../../api/utils.ts';
import { useRestaurant } from "../../components/globals/restaurantContext";


export default function useMenuDefault() {
    const navigate = useNavigate()
    const { showToast } = useToast();
    const [menus, setMenus] =  useState<Menu[]>([])
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const pageSize = 25;

    const { selectedRestaurantId } = useRestaurant();

    const handleView = (menu: Menu) => {
        console.log('View menu:', menu);
    };
    const handleEdit = (menu: Menu) => {
        navigate(`/menu/edit/${menu.id}`);
    };
    const handleDelete = (menu: Menu) => {
        console.log('Delete menu:', menu);
    };

    const handleToggleMenu = async (menuId: number,isActive: boolean,menuName: string) => {
        try {
            const response = await updateMenuStatusApi(menuId, isActive);

            if (!response.ok) {
                throw new Error(await getApiErrorMessage(response));
            }

            setMenus((previousMenus) =>
                previousMenus.map((menu) => ({
                    ...menu,
                    is_active: menu.id === menuId ? isActive: isActive? false : menu.is_active,
                }))
            );

            showToast(
                `${menuName} ${isActive ? 'activated' : 'deactivated'} successfully!`,
                'success'
            );
            
        } catch (error) {
            showToast(
                error instanceof Error
                    ? error.message
                    : 'Failed to update menu status.',
                'error'
            );
        }
    };
    useEffect(() => {
        // console.log(selectedRestaurantId)
        let cancelled = false;

        async function fetchMenus() {
            try {
                setLoading(true);
                setError('');
                // await new Promise(resolve => setTimeout(resolve, 5000))

                const response = await getMenus({
                    page,
                    page_size: pageSize,
                    sort_by: 'created_at',
                    sort_order: 'asc',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch menus');
                }

                const result: { data?: Menu[]; total_items?: number } = await response.json();
                if (!Array.isArray(result.data)) {
                    throw new Error('The menus response was invalid.');
                }

                if (!cancelled) {
                    setMenus(result.data);
                    setTotalItems(
                        typeof result.total_items === 'number'
                            ? result.total_items
                            : (page - 1) * pageSize + result.data.length
                    );
                    setHasNextPage(
                        typeof result.total_items === 'number'
                            ? page * pageSize < result.total_items
                            : result.data.length === pageSize
                    );
                }
            } catch (error: any) {
                if (!cancelled) {
                    setError(
                        error.message || 'Something went wrong'
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchMenus();

        return () => {
            cancelled = true;
        };
    }, [page, selectedRestaurantId]);

    useEffect(() => {
        setPage(1);
    }, [selectedRestaurantId]);

    return { 
        navigate,
        // showToast,
        menus,
        page,
        pageSize,
        totalItems,
        hasNextPage,
        setPage,
        setMenus, 
        loading,
        setLoading, 
        error,
        setError,
        handleView, 
        handleEdit, 
        handleDelete,
        handleToggleMenu
    };
}