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
    defaultValue?: string;
    inputRef?: React.Ref<HTMLSelectElement>;
}

const Select: React.FC<SelectProps> = ({
    options,
    placeholder = "Select an option",
    className = "",
    value,
    defaultValue,
    // inputRef,
    ...rest
}) => {

    return (
        <select
            // ref={inputRef}
            // value={value}
            // defaultValue={defaultValue}
            className={`h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 text-gray-800 ${className}`}
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
