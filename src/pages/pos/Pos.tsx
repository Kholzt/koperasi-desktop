import React, { useEffect, useState } from "react";

import { Link } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useTheme } from "../../context/ThemeContext";
import { SearchIcon } from "../../icons";
import axios from "../../utils/axios";
import { PosProps, PaginationProps } from "../../utils/types";
import Table from "./PosTable";
const Pos: React.FC = () => {
    const [search, setSearch] = useState<String | null>("");
    const [pos, setPos] = useState<PosProps[]>([]);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0
    });
    const { reload } = useTheme();
    useEffect(() => {
        axios.get(`/api/pos?page=${pagination?.page}&search=${search}`).then((res: any) => {
            setPos(res.data.pos)
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
                title={`POS | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle="POS" />

            <div className="space-y-6">
                <ComponentCard title="POS" option={
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
                        <Link to={"/pos/create"}>
                            <Button size="sm">
                                Tambah Pos
                            </Button></Link></div>}>
                    <Table
                        pagination={pagination}
                        data={pos}
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

export default Pos;
