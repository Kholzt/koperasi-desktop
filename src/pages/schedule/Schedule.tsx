import React, { useEffect, useState } from "react";

import { Link } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
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
    useEffect(() => {
        axios.get(`/api/schedule?page=${pagination?.page}&search=${search}&status=all`).then((res: any) => {
            setSchedules(res.data.schedule)
            setPagination(res.data.pagination)
        });
    }, [pagination.page, reload, search]);


    const searchAction = (e: any) => {
        const value = e.target.value;
        setSearch(value)
        setPagination((prev) => ({
            ...prev,
            page: 1,
        }))
    }

    return (
        <>
            <PageMeta
                title={`Jadwal Kunjungan | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle="Jadwal Kunjungan" />

            <div className="space-y-6">
                <ComponentCard title="Jadwal Kunjungan" option={
                    <div className="flex gap-4">
                        {/* <div className="relative">
                            <Input
                                onChange={searchAction}
                                placeholder="Pencarian"
                                type="text"
                                className="pl-[62px]"
                            />
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                <SearchIcon className="size-6 text-gray-600" fill="#787878" color="#fff" />
                            </span>
                        </div> */}
                        <Link to={"/schedule/create"}>
                            <Button size="sm">
                                Tambah Jadwal
                            </Button></Link></div>}>
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
