import { useEffect, useRef, useState, type ChangeEvent } from "react";

import type { MenuItemFormFieldsProps } from "../../types/menu.ts";

export default function MenuItemFormFields({
    item,
    idPrefix,
    onChange,
    onRemove,
    onImageSelect,
    onDeleteExistingImage,
}: MenuItemFormFieldsProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDeletingImage, setIsDeletingImage] = useState(false);

    // Clean up the temporary image URL when replaced or unmounted.
    useEffect(() => {
        return () => {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
            }
        };
    }, []);

    const handleImageChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        // Allow the same file to be selected again.
        event.target.value = "";

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please select a JPG, PNG, or WebP image.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("Image must be 5 MB or smaller.");
            return;
        }

        // Release the previous temporary URL.
        if (previewUrlRef.current) {
            URL.revokeObjectURL(previewUrlRef.current);
        }

        const objectUrl = URL.createObjectURL(file);

        previewUrlRef.current = objectUrl;
        setPreviewUrl(objectUrl);

        // Pass the actual file to the parent for uploading.
        onImageSelect(file);
    };
    
    const handleRemoveImage = async () => {
        // If a new file is previewed, clear only that selection.
        if (previewUrl) {
            if (previewUrlRef.current) {
                URL.revokeObjectURL(previewUrlRef.current);
                previewUrlRef.current = null;
            }

            setPreviewUrl(null);
            onImageSelect(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            return;
        }

        // Delete an existing server image through the parent callback.
        if (item.image_url) {
            if (!onDeleteExistingImage) {
                // alert("Image deletion is not configured.");
                return;
            }

            try {
                setIsDeletingImage(true);
                
                // await new Promise((resolve) => setTimeout(resolve, 4000));

                await onDeleteExistingImage(item.image_url);

                onChange("image_url", null);
                onImageSelect(null);

                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } catch (error) {
                console.error("Failed to delete image:", error);

                alert(
                    error instanceof Error
                        ? error.message
                        : "Failed to delete image. Please try again."
                );
            } finally {
                setIsDeletingImage(false);
            }

            return;
        }

        onImageSelect(null);
    };
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <div className="flex flex-1 flex-col gap-1">
                    <label
                        htmlFor={`${idPrefix}-name`}
                        className="text-sm font-medium text-slate-600"
                    >
                        Item Name
                    </label>

                    <input
                        id={`${idPrefix}-name`}
                        type="text"
                        value={item.item_name}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onChange("item_name", event.target.value)
                        }
                        placeholder="Enter menu item name"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]/20"
                    />
                </div>

                <div className="flex w-28 flex-col gap-1">
                    <label
                        htmlFor={`${idPrefix}-price`}
                        className="text-sm font-medium text-slate-600"
                    >
                        Price
                    </label>

                    <input
                        id={`${idPrefix}-price`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onChange(
                                "price",
                                event.target.value === ""
                                    ? 0
                                    : Number(event.target.value),
                            )
                        }
                        placeholder="0.00"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]/20"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <label
                    htmlFor={`${idPrefix}-description`}
                    className="text-sm font-medium text-slate-600"
                >
                    Description
                </label>

                <textarea
                    id={`${idPrefix}-description`}
                    value={item.description}
                    onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                        onChange("description", event.target.value)
                    }
                    placeholder="Describe this menu item"
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]/20"
                />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
                <label
                    htmlFor={`${idPrefix}-image`}
                    className="text-sm font-medium text-slate-600"
                >
                    Menu Item Image
                </label>

                {(previewUrl || item.image_url) && (
                    <div className="relative w-fit">
                        <img
                            src={previewUrl ?? item.image_url ?? undefined}
                            alt={`${item.item_name || "Menu item"} preview`}
                            className="h-40 w-40 rounded-lg border border-slate-200 object-cover shadow-sm"
                        />

                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isDeletingImage}
                            aria-label={isDeletingImage ? "Deleting image" : "Remove menu item image"}
                            className={`cursor-pointer absolute -right-2 -top-2 z-10 flex items-center justify-center gap-2 rounded-full shadow-md transition ${
                                isDeletingImage
                                    ? "cursor-wait bg-[#6495ED] px-3 py-2 text-white"
                                    : "h-7 w-7 bg-[#6495ED] text-lg font-semibold leading-none text-white hover:bg-blue-500"
                            }`}
                        >
                            {isDeletingImage ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                    <span className="whitespace-nowrap text-xs font-medium">
                                        Deleting image...
                                    </span>
                                </>
                            ) : (
                                <span aria-hidden="true">×</span>
                            )}
                        </button>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    id={`${idPrefix}-image`}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#6495ED] file:px-4 file:py-2 file:font-medium file:text-white file:transition hover:file:bg-blue-500"
                />

                <p className="text-xs text-slate-500">
                    JPG, PNG, or WebP. Maximum size: 5 MB.
                </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                    <input
                        type="checkbox"
                        checked={item.is_available}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onChange("is_available", event.target.checked)
                        }
                        className="peer sr-only"
                    />

                    <span className="relative h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-[#6495ED] peer-focus-visible:ring-2 peer-focus-visible:ring-[#6495ED] peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5" />

                    Available
                </label>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor={`${idPrefix}-sort`}
                        className="text-sm font-medium text-slate-600"
                    >
                        Sort Order
                    </label>

                    <input
                        id={`${idPrefix}-sort`}
                        type="number"
                        min="0"
                        value={item.sort_order}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                            onChange(
                                "sort_order",
                                event.target.value === ""
                                    ? 0
                                    : Number(event.target.value),
                            )
                        }
                        className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 outline-none transition focus:border-[#6495ED] focus:ring-2 focus:ring-[#6495ED]/20"
                    />
                </div>

                <button
                    type="button"
                    onClick={onRemove}
                    className="cursor-pointer rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                    Remove Item
                </button>
            </div>
        </div>
    );
}