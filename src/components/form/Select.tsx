import React from "react";

interface Option {
    value: string;
    label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: Option[];
    placeholder?: string;
    className?: string;
    // react-hook-form support
    value?: string;
    readOnly: boolean;
    defaultValue?: string;
    inputRef?: React.Ref<HTMLSelectElement>;
}

const Select: React.FC<SelectProps> = ({
    options,
    placeholder = "Select an option",
    className = "",
    value,
    defaultValue,
    readOnly,
    // inputRef,
    ...rest
}) => {
    return (
        <select
            // ref={inputRef}
            // value={value}
            defaultValue={defaultValue}
            className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10  ${className} ${readOnly ? "bg-gray-50 dark:bg-white/[0.03] text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800 pointer-events-none" : "dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800"}`}
            {...rest}
        >
            <option value="" disabled hidden selected>
                {placeholder}
            </option>
            {options.map((option) => (
                <option
                    key={option.value}
                    value={option.value}
                    className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default Select;
