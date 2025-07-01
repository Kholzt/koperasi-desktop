// components/Pagination.tsx
import React from "react";
import { ArrowRightIcon, ChevronLeftIcon } from "../../../icons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    maxVisible?: number;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    maxVisible = 6,
}) => {
    const getVisiblePages = () => {
        const half = Math.floor(maxVisible / 2);
        let start = Math.max(1, currentPage - half);
        let end = start + maxVisible - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxVisible + 1);
        }

        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-white/[0.05]">
            <span className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-400 ">
                Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center justify-between">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg transition px-4 py-3 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                    disabled={currentPage === 1}
                >
                    <ChevronLeftIcon /><span className="hidden sm:inline">Previous</span>
                </button>

                <div className="flex gap-4 items-center">

                    <button
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm ring-1 ring-inset ring-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                    >
                        &laquo;
                    </button>
                    <ul className="hidden items-center gap-0.5 sm:flex">
                        {visiblePages.map((page) => (
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
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        className="hidden sm:inline-flex items-center justify-center px-3 py-2 rounded-lg text-sm ring-1 ring-inset ring-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]"
                    >
                        &raquo;
                    </button>
                </div>
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
