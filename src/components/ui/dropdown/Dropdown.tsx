import type React from "react";
import { useEffect, useRef } from "react";

interface DropdownProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
    isOpen,
    onClose,
    children,
    className = "",
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!dropdownRef.current) return;

            const clickedElement = event.target as HTMLElement;
            const isInsideDropdown = dropdownRef.current.contains(clickedElement);
            const isThisToggle = clickedElement.closest(".dropdown-toggle") && dropdownRef.current.contains(clickedElement.closest(".dropdown-toggle")!);

            if (!isInsideDropdown && !isThisToggle) {
                onClose(); // Tutup dropdown ini
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className={`absolute z-40  right-0 mt-2  rounded-xl border border-gray-200 bg-white  shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
        >
            {children}
        </div>
    );
};
