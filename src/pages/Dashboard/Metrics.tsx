import React from 'react'
import {
    ArrowDownIcon,
    ArrowUpIcon,
    BoxIconLine,
    GroupIcon,
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
const Metrics: React.FC = () => {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">

            <MetricItem title='Anggota' count={20} />
            <MetricItem title='Kelompok' count={20} />
            <MetricItem title='Wilayah' count={20} />
        </div>
    )

    function MetricItem({ title, count }: { title: string, count: number }) {
        return <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
            </div>

            <div className="flex items-end justify-between mt-5">
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {title}
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {count}
                    </h4>
                </div>
                <Badge color="success">
                    <ArrowUpIcon />
                    11.01%
                </Badge>
            </div>
        </div>;
    }
}

export default Metrics
