import React, { useEffect, useState } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import { MemberProps, PaginationProps, UserProps } from "../../utils/types";
import Table from "./MemberTable";
import axios from "../../utils/axios";
import Button from "../../components/ui/button/Button";
import { Link } from "react-router";
import { useTheme } from "../../context/ThemeContext";
import Input from "../../components/form/input/InputField";
import { SearchIcon } from "../../icons";
const Member: React.FC = () => {
    const [search, setSearch] = useState<String | null>("");
    const [members, setMembers] = useState<MemberProps[]>([]);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0
    });
    const { reload } = useTheme();
    useEffect(() => {
        axios.get(`/api/members?page=${pagination?.page}&search=${search}`).then((res: any) => {
            setMembers(res.data.members)
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
                title={`Anggota | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle="Anggota" />

            <div className="space-y-6">
                <ComponentCard title="Anggota" option={
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
                        <Link to={"/member/create"}>
                            <Button size="sm">
                                Tambah Anggota
                            </Button></Link></div>}>
                    <Table
                        pagination={pagination}
                        data={members}
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

export default Member;
