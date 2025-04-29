import React, { useEffect, useState } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { PaginationProps, UserProps } from "../../utils/types";
import Table from "./EmployeTable";
import axios from "../../utils/axios";
import Button from "../../components/ui/button/Button";
import { Link } from "react-router";
import { useTheme } from "../../context/ThemeContext";
import Input from "../../components/form/input/InputField";
import { SearchIcon } from "../../icons";
const Employe: React.FC = () => {
    const [search, setSearch] = useState<String | null>("");
    const [users, setUsers] = useState<UserProps[]>([]);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0
    });
    const { reload } = useTheme();
    useEffect(() => {
        axios.get(`/api/employees?page=${pagination?.page}&search=${search}`).then((res: any) => {
            setUsers(res.data.employees)
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
                title={`Karyawan | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle="Karyawan" />

            <div className="space-y-6">
                <ComponentCard title="Karyawan" option={
                    <div className="flex gap-4">
                        <div className="relative">
                            <Input
                                onChange={searchAction}
                                placeholder="Pencarian"
                                type="text"
                                className="pl-[62px]"
                            />
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                <SearchIcon className="size-6 text-gray-600" fill="#787878" color="#fff" />
                            </span>
                        </div>
                        <Link to={"/employe/create"}>
                            <Button size="sm">
                                Tambah Karyawan
                            </Button></Link></div>}>
                    <Table
                        pagination={pagination}
                        data={users}
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

export default Employe;
