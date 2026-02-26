import React, { useEffect, useState } from "react";

import { Link } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import { useTheme } from "../../context/ThemeContext";
import { SearchIcon } from "../../icons";
import axios from "../../utils/axios";
import { PaginationProps, ActivityProps } from "../../utils/types";
import Table from "./ActivityTable";
import SelectSearch from "../../components/form/SelectSearch";
const LogActivity: React.FC = () => {
    const [filter, setFilter] = useState<{ menu: string | null, }>({
        menu: '',
    });
    const [search, setSearch] = useState<String | null>("");
    const [activity, setActivity] = useState<ActivityProps[]>([]);
    const [menu, setMenu] = useState<{ label: string, value: string }[]>([]);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 100,
        total: 0
    });
    const { reload } = useTheme();
    useEffect(() => {
        axios.get(`/api/activity?page=${pagination?.page}&search=${search}&menu=${filter.menu}`).then((res: any) => {
            setActivity(res.data.activity)
            setPagination(res.data.pagination)
        });
        axios.get("/api/listMenu").then((res: any) => {
            const options = Object.entries(res.data.menu).map(([key, value]) => ({
                label: value,
                value: key,
            }));
            let updated = [{ label: "Semua Menu", value: '' }, ...options];
            const opsi = updated.map((option) => ({
                label: (option.label as string).replace('_', ' '), value: option.value,
            }));
            setMenu(opsi);
        });
    }, [pagination.page, reload, search, filter]);


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
                title={`Aktivitas | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle="Aktivitas" />

            <div className="space-y-6">
                <div className="grid grid-cols-4 gap-2  items-center mb-6">
                    <SelectSearch
                        label=""
                        placeholder="Pilih Menu"
                        options={menu}
                        defaultValue={filter.menu ?? undefined}
                        onChange={(val: any) => setFilter({ ...filter, menu: val })}
                    />
                    <Input
                        onChange={searchAction}
                        placeholder="Pencarian"
                        type="text"
                        className=" mt-1 mr-5"
                    />
                </div>

                <ComponentCard title="Aktivitas" >
                    <Table
                        pagination={pagination}
                        data={activity}
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

export default LogActivity;
