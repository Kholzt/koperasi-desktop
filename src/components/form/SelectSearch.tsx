import React, { useEffect, useRef, useState } from "react";

interface Option {
    value: string;
    label: string;
}

interface SelectSearchProps {
    label: string;
    placeholder: string;
    options: Option[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

const SelectSearch: React.FC<SelectSearchProps> = ({
    label,
    placeholder,
    options,
    defaultValue = "",
    onChange,
    disabled = false,
}) => {
    const [selected, setSelected] = useState<string>(defaultValue);
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedText = options.find(opt => opt.value === selected)?.label;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (value: string) => {
        setSelected(value);
        onChange?.(value);
        setIsOpen(false);
        setSearchTerm("");
    };

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full" ref={containerRef}>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                {label}
            </label>

            <div className="relative">
                <div
                    onClick={() => !disabled && setIsOpen(prev => !prev)}
                    className="flex min-h-11 items-center rounded-lg border border-gray-300 px-3 py-2 shadow-theme-xs cursor-pointer dark:border-gray-700 dark:bg-gray-900"
                >
                    <span className={`text-sm ${selectedText ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-white"}`}>
                        {selectedText || placeholder}
                    </span>
                    <div className="ml-auto text-gray-500 dark:text-gray-400">
                        <svg
                            className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                        >
                            <path
                                d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-hidden dark:bg-gray-900 dark:border-gray-700">
                        <div className="p-2">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-800 dark:text-white"
                            />
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelect(option.value)}
                                        className="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-white/90 dark:hover:bg-gray-700"
                                    >
                                        {option.label}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">
                                    No options found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectSearch;
