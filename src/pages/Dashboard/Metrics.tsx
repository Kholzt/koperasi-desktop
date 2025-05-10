import React, { useState, useEffect, SVGProps } from 'react'
import {
    ArrowDownIcon,
    ArrowUpIcon,
    BoxIconLine,
    GroupIcon,
    LocationIcon,
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import axios from '../../utils/axios';
const Metrics: React.FC = () => {

    const [memberCount, setMemberCount] = useState(0);
    const [areaCount, setAreaCount] = useState(0);
    const [groupCount, setGroupCount] = useState(0);
    useEffect(() => {
        axios("/api/members/count").then(data => setMemberCount(data.data.total));
        axios("/api/areas/count").then(data => setAreaCount(data.data.total));
        axios("/api/groups/count").then(data => setGroupCount(data.data.total));
    }, []);
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">

            <MetricItem Icon={GroupIcon} title='Anggota' count={memberCount} />
            <MetricItem Icon={GroupIcon} title='Kelompok' count={groupCount} />
            <MetricItem Icon={LocationIcon} title='Wilayah' count={areaCount} />
        </div>
    )

    function MetricItem({ title, count, Icon }: { title: string, count: number, Icon: React.FC<SVGProps<SVGSVGElement>> }) {
        return <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Icon className="text-gray-800 size-6 dark:text-white/90" />
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
