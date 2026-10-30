import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreHorizontal, Eye, Pencil, Trash2 } from 'lucide-react';
import type {Menu,MenuActionsProps} from '../../types/menu.ts';

export default function MenuActions({
    menu, onView, onEdit, onDelete }:MenuActionsProps) {

    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    function toggleDropdown() {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 160;
            const dropdownHeight = 132;

            const left = Math.min(
                rect.right - dropdownWidth,
                window.innerWidth - dropdownWidth - 8
            );

            const top =
                rect.bottom + dropdownHeight > window.innerHeight
                    ? rect.top - dropdownHeight
                    : rect.bottom + 4;

            setPosition({
                top: Math.max(8, top),
                left: Math.max(8, left),
            });
        }

        setIsOpen(true);
    }

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event: any) {
            if (!buttonRef.current?.contains(event.target) && !dropdownRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        }

        function handleEscape(event: any) {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        }

        function handleScroll() {
            setIsOpen(false);
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    function handleAction(
        callback: (menu: Menu) => void) {
        setIsOpen(false);
        callback(menu);
    }

    return (
        <>
            <div className="flex justify-end">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleDropdown}
                    className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    aria-label={`Actions for ${menu.menu_name}`}
                    aria-expanded={isOpen}
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {isOpen &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: 'fixed',
                            top: position.top,
                            left: position.left,
                            width: 160,
                        }}
                        className="z-[9999] rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg"
                    >
                        <button
                            type="button"
                            onClick={() => handleAction(onView)}
                            className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            <Eye size={16} />
                            View
                        </button>

                        <button
                            type="button"
                            onClick={() => handleAction(onEdit)}
                            className="flex cursor-pointer w-full items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        >
                            <Pencil size={16} />
                            Edit
                        </button>

                        <div className="my-1 border-t border-slate-100" />

                        <button
                            type="button"
                            onClick={() => handleAction(onDelete)}
                            className="cursor-pointer flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    </div>,
                    document.body
                )}
        </>
    );
}