import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import SelectSearch from "../../components/form/SelectSearch";
import Input from "../../components/form/input/InputField";
import Loading from "../../components/ui/Loading";
import Button from "../../components/ui/button/Button";

import { useTheme } from "../../context/ThemeContext";
import { SearchIcon } from "../../icons";
import { useLoan } from './hooks/useLoan';
import Filter from './components/Filter';
import Table from './LoanTable';

const days = [
    'all', "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"
]


const Loan: React.FC = () => {
    const {
        loans,
        groups,
        pagination,
        setPagination,
        filter,
        setFilter,
        dayFilter,
        setDayFilter,
        groupFilter,
        setGroupFilter,
        search,
        setSearch,
        isFiltersLoaded,
        fetchLoans,
    } = useLoan();
    const [searchParams] = useSearchParams();
    const { reload } = useTheme();

    useEffect(() => {
        fetchLoans(pagination.page);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, reload, filter.endDate, filter.startDate, filter.status, dayFilter, groupFilter, search]);


    useEffect(() => {

        if (!isFiltersLoaded) return;

        const savedFilters = {
            endDate: filter.endDate,
            startDate: filter.startDate,
            status: filter.status,
            dayFilter,
            groupFilter,
            // search,
            page: pagination?.page
        };
        localStorage.setItem('filters', JSON.stringify(savedFilters));

    }, [filter.endDate, filter.startDate, filter.status, dayFilter, groupFilter, search, isFiltersLoaded, pagination?.page]);

    const searchAction = (e: any) => {
        const value = e.target.value;
        setSearch(value)
        setPagination((prev) => ({
            ...prev,
            page: 1,
        }))
    }



    if (!isFiltersLoaded) return <Loading />;
    return (
        <>
            <PageMeta title={`Peminjaman | ${import.meta.env.VITE_APP_NAME}`} description="" />
            <PageBreadcrumb pageTitle="Peminjaman" />

            <div className="">
                <div className="flex gap-2 mb-2 items-center">
                    <ul className="flex mt-1.5">
                        {days.map((day, i) => {
                            const isActive = dayFilter === day;
                            return (
                                <li
                                    key={i}
                                    className={`
                                    border-y
                                    ${isActive ? "bg-brand-600 text-white dark:text-white" : "hover:bg-white/[0.03] dark:hover:bg-white/[0.03] bg-white dark:bg-gray-900 dark:text-gray-200"}
                                    ${i === 0 ? "rounded-l-lg border-l" : ""}
                                    ${i === days.length - 1 ? "rounded-r-lg border-r" : ""}
                                    dark:border-gray-700
                                     `}
                                >
                                    <button
                                        className="px-4 py-2 capitalize"
                                        onClick={() => setDayFilter(day)}
                                    >
                                        {day}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="max-w-[300px] w-full">
                        {isFiltersLoaded && <SelectSearch
                            label=""
                            placeholder="Pilih kelompok"
                            options={[{ label: "All", value: "all" }, ...groups]}
                            defaultValue={groupFilter}
                            onChange={(val: any) => setGroupFilter(val)}
                        />}

                    </div>
                </div>

                <ComponentCard
                    title="Peminjaman"
                    option={
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
                            {isFiltersLoaded && <Filter filter={filter} setFilter={setFilter} />}
                            <Link to={"/loan/create"}>
                                <Button size="sm">Tambah Peminjaman</Button>
                            </Link>
                        </div>
                    }
                >
                    <Table
                        data={loans}
                        pagination={pagination}
                        setPaginate={(page) =>
                            setPagination((prev) => ({
                                ...prev,
                                page
                            }))
                        }
                    />
                </ComponentCard>
            </div>
        </>
    );
};

export default Loan;
