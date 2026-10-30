import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CollapsibleSectionProps } from "../../types/global.ts";


export default function CollapsibleSection({
    title,
    children,
    defaultOpen = true,
    className = "",

}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <section className={className}>
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                aria-expanded={isOpen}
                className="cursor-pointer flex w-full items-center justify-between gap-3 py-3 text-left"
            >
                <span className="font-semibold text-slate-600">
                    {title}
                </span>

                {isOpen ? (
                    <ChevronDown size={20} className="text-slate-500" />
                ) : (
                    <ChevronRight size={20} className="text-slate-500" />
                )}
            </button>

            <div className={isOpen ? "pb-3" : "hidden"}>
                {children}
            </div>
        </section>
    );
}