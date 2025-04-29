// components/Pagination.tsx
import React from "react";
import { ArrowRightIcon, ChevronLeftIcon } from "../../../icons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                    disabled={currentPage === 1}
                >
                    <ChevronLeftIcon /><span className="hidden sm:inline">Previous</span>
                </button>

                <span className="block text-sm font-medium text-gray-700 dark:text-gray-400 sm:hidden">
                    Page {currentPage} of {totalPages}
                </span>

                <ul className="hidden items-center gap-0.5 sm:flex">
                    {pageNumbers.map((page) => (
                        <li key={page}>
                            <button
                                onClick={() => onPageChange(page)}
                                className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${currentPage === page
                                    ? "bg-brand-500 text-white"
                                    : "text-gray-700 hover:bg-brand-500/[0.08] dark:hover:bg-brand-500 dark:hover:text-white hover:text-brand-500 dark:text-gray-400"
                                    }`}
                            >
                                {page}
                            </button>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                    disabled={currentPage === totalPages}
                >
                    <span className="hidden sm:inline">Next</span><ArrowRightIcon />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
