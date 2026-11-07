import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionMenuProps } from "../../types/global";



export default function ActionMenu<T>({
    item,
    itemLabel,
    actions,
}: ActionMenuProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownHeight = actions.length * 40
        + actions.filter((action) => action.separatorBefore).length * 9
        + 8;

    function toggleDropdown() {
        if (isOpen) {
            setIsOpen(false);
            return;
        }

        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const dropdownWidth = 160;
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

        function handleClickOutside(event: MouseEvent) {
            const target = event.target;
            if (
                target instanceof Node
                && !buttonRef.current?.contains(target)
                && !dropdownRef.current?.contains(target)
            ) {
                setIsOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false);
        }

        function handleScroll() {
            setIsOpen(false);
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    return (
        <>
            <div className="flex justify-end">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleDropdown}
                    className="cursor-pointer rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                    aria-label={`Actions for ${itemLabel}`}
                    aria-expanded={isOpen}
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    style={{
                        position: "fixed",
                        top: position.top,
                        left: position.left,
                        width: 160,
                    }}
                    className="z-[9999] rounded-lg border border-slate-200 bg-white py-1 text-left shadow-lg"
                >
                    {actions.map((action, index) => {
                        const Icon = action.icon;

                        return (
                            <div key={`${action.label}-${index}`}>
                                {action.separatorBefore && (
                                    <div className="my-1 border-t border-slate-100" />
                                )}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsOpen(false);
                                        action.onSelect(item);
                                    }}
                                    className={`flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm ${
                                        action.variant === "danger"
                                            ? "text-red-600 hover:bg-red-50"
                                            : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                >
                                    <Icon size={16} />
                                    {action.label}
                                </button>
                            </div>
                        );
                    })}
                </div>,
                document.body
            )}
        </>
    );
}
