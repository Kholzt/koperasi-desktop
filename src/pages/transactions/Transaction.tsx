import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { useTheme } from "../../context/ThemeContext";
import axios from "../../utils/axios";
import { GroupProps, LoanProps, PaginationProps, ScheduleProps } from "../../utils/types";
import Table from "./TransactionTable";
import SelectSearch from "../../components/form/SelectSearch";
import { toLocalDate } from "../../utils/helpers";
import { SearchIcon } from "../../icons";
import Input from "../../components/form/input/InputField";

const days = [
    'all', "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"
]
const dayMap: any = {
    all: 'all',
    senin: 'monday',
    selasa: 'tuesday',
    rabu: 'wednesday',
    kamis: 'thursday',
    jumat: 'friday',
    sabtu: 'saturday'
};

const Transaction: React.FC = () => {
    const [filter, setFilter] = useState<{ startDate: String | null; endDate: String | null; status: string | null }>({
        startDate: null,
        endDate: null,
        status: null
    });
    const [loans, setLoans] = useState<LoanProps[]>([]);
    const [dayFilter, setDayFilter] = useState("all");
    const [groupFilter, setGroupFilter] = useState("all");
    const [groups, setGroups] = useState<{ label: string, value: string }[]>([]);
    const [search, setSearch] = useState<String | null>("");
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0
    });
    const { reload } = useTheme();

    useEffect(() => {
        axios
            .get(`/api/loans?page=${pagination?.page}&status=${filter.status}&startDate=${filter.startDate}&endDate=${filter.endDate}&day=${dayMap[dayFilter]}&group=${groupFilter}&search=${search}`)
            .then((res: any) => {
                setLoans(res.data.loans);
                setPagination(res.data.pagination);
            });
        axios
            .get(`/api/schedule?limit=20000000`)
            .then((res: any) => {
                const { schedule } = res.data
                let scheduleFilter = schedule.filter((s: any) => dayFilter == "all" || s.day == dayFilter);
                setGroups(scheduleFilter.map((group: ScheduleProps) => ({ label: group.group.group_name + " | " + group.day, value: group.group.id })))
            });
        console.log(groupFilter, `/api/loans?page=${pagination?.page}&status=${filter.status}&startDate=${filter.startDate}&endDate=${filter.endDate}&day=${dayMap[dayFilter]}&group=${groupFilter}`);
    }, [pagination.page, reload, filter.endDate, filter.startDate, filter.status, dayFilter, groupFilter, search]);


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
            <PageMeta title={`Transaksi | ${import.meta.env.VITE_APP_NAME}`} description="" />
            <PageBreadcrumb pageTitle="Transaksi" />

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
                        <SelectSearch
                            label=""
                            placeholder="Pilih kelompok"
                            options={[{ label: "All", value: "all" }, ...groups]}
                            defaultValue={groupFilter}
                            onChange={(val: any) => setGroupFilter(val)}
                        />
                    </div>
                </div>

                <ComponentCard
                    title="Transaksi"
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
                            <Filter filter={filter} setFilter={setFilter} />
                            <Link to={"/transactions/create"}>
                                <Button size="sm">Tambah Transaksi</Button>
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

interface FilterProps {
    filter: {
        startDate: String | null;
        endDate: String | null;
        status: string | null;
    };
    setFilter: (filter: { startDate: String | null; endDate: String | null; status: string | null }) => void;
}

const Filter: React.FC<FilterProps> = ({ filter, setFilter }) => {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [startDate, setStartDate] = useState<String | null>(filter.startDate);
    const [endDate, setEndDate] = useState<String | null>(filter.endDate);
    const [status, setStatus] = useState<string | null>(filter.status);

    const openDropdown = () => setIsOpenDropdown(true);
    const closeDropdown = () => setIsOpenDropdown(false);

    const handleFilter = () => {
        setFilter({ startDate, endDate, status });
        closeDropdown();
    };

    return (
        <div className="relative">
            <Button
                size="sm"
                variant="outline"
                onClick={openDropdown}
                className="flex items-center text-gray-700 dark:text-gray-400 px-4"
            >
                Filter
            </Button>

            <Dropdown
                isOpen={isOpenDropdown}
                onClose={closeDropdown}
                className="absolute right-0 mt-[17px] w-[600px] rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
            >
                <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block mb-1 font-medium">Tanggal Peminjaman</label>
                        <DatePicker
                            id={"startDate"}
                            mode="range"
                            placeholder="Tanggal peminjaman"
                            defaultDate={
                                startDate && endDate
                                    ? [new Date(startDate as string), new Date(endDate as string)]
                                    : (startDate ? [new Date(startDate as string)] : undefined)
                            }
                            onChange={(date) => {
                                setStartDate(toLocalDate(date[0]));
                                date[1]
                                    ? setEndDate(toLocalDate(date[1]))
                                    : setEndDate(null);
                            }}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Status Peminjaman</label>
                        <Select
                            placeholder="Pilih status"
                            options={[
                                { label: "Semua", value: "" },
                                { label: "Aktif", value: "aktif" },
                                { label: "Menunggak", value: "menunggak" },
                                { label: "Lunas", value: "lunas" }
                            ]}
                            className="w-full rounded-md border px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                            value={status ?? ""}
                            defaultValue={status ?? ""}
                            onChange={(e) => setStatus(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={closeDropdown}>
                            Batal
                        </Button>
                        <Button size="sm" onClick={handleFilter}>
                            Terapkan
                        </Button>
                    </div>
                </div>
            </Dropdown>
        </div>
    );
};

export default Transaction;
