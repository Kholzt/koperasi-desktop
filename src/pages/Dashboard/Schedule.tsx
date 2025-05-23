import React, { useEffect, useState } from "react";

import ComponentCard from "../../components/common/ComponentCard";
import { useTheme } from "../../context/ThemeContext";
import axios from "../../utils/axios";
import { PaginationProps, ScheduleProps } from "../../utils/types";
import Table from "./ScheduleTable";
const Schedule: React.FC = () => {
    const [search, setSearch] = useState<String | null>("");
    const [schedule, setSchedules] = useState<ScheduleProps[]>([]);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0
    });
    const { reload } = useTheme();
    const days = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
    const day = days[new Date().getDay()];
    useEffect(() => {
        axios.get(`/api/schedule?page=${pagination?.page}&day=${day}`).then((res: any) => {
            setSchedules(res.data.schedule)
            setPagination(res.data.pagination)
        });
    }, [pagination.page, reload, search]);

    return (
        <>
            <div className="space-y-6">
                <ComponentCard title={`Jadwal Kunjungan Hari ${day}`}>
                    <Table
                        pagination={pagination}
                        data={schedule}
                        setPaginate={(page) => {
                            setPagination((prev) => ({
                                ...prev,
                                page,
                            }));
                        }}
                    />
                </ComponentCard>
            </div>
        </>
    );
}

export default Schedule;
