import React, { SVGProps } from 'react';
import { formatCurrency } from '../../utils/helpers';

export function MetricItem({ title, count, Icon, onClick, hasPointer = false, isCurrency = false, isDoubleTitle = false, valueClassName = "", valueClassName2 = "", count2 = 0, FirstIcon, SecondIcon }: {
    hasPointer?: boolean;
    title: string;
    count: number | string;
    Icon: React.FC<SVGProps<SVGSVGElement>>;
    onClick?: () => void;
    isCurrency?: boolean;
    isDoubleTitle?: boolean;
    valueClassName?: string;
    valueClassName2?: string;
    count2?: number | string,
    FirstIcon?: React.FC<SVGProps<SVGSVGElement>>,
    SecondIcon?: React.FC<SVGProps<SVGSVGElement>>
}) {
    return <div onClick={onClick} className={`${hasPointer ? "cursor-pointer" : "cursor-auto"} rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6`}>
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <Icon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
            <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {title}
                </span>
                <h4 className={`mt-2 font-bold text-title-sm ${valueClassName ? valueClassName : "text-gray-800 dark:text-white/90"}`}>
                    {isCurrency ? formatCurrency(Number(count)) : count} {FirstIcon && <FirstIcon className={`size-4 inline-block ml-1 ${valueClassName ? valueClassName : "text-gray-800 dark:text-white/90"}`} />}
                </h4>
                {isDoubleTitle && <h3 className={`mt-2 font-bold text-title-sm ${valueClassName2 ? valueClassName2 : "text-gray-800 dark:text-white/90"}`}>
                    {isCurrency ? formatCurrency(Number(count2)) : count2} {SecondIcon && <SecondIcon className={`size-4 inline-block ml-1 ${valueClassName2 ? valueClassName2 : "text-gray-800 dark:text-white/90"}`} />}
                </h3>}
            </div>
        </div>
    </div>;
}
