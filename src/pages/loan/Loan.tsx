import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { useTheme } from "../../context/ThemeContext";
import axios from "../../utils/axios";
import { LoanProps, PaginationProps } from "../../utils/types";
import Table from "./LoanTable";
import DatePicker from "../../components/form/date-picker";

const Loan: React.FC = () => {
    const [filter, setFilter] = useState<{ startDate: String | null; endDate: String | null; status: string | null }>({
        startDate: null,
        endDate: null,
        status: null
    });
    const [areas, setLoans] = useState<LoanProps[]>([]);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0
    });
    const { reload } = useTheme();

    useEffect(() => {
        axios
            .get(`/api/loans?page=${pagination?.page}&status=${filter.status}&startDate=${filter.startDate}&endDate=${filter.endDate}`)
            .then((res: any) => {
                setLoans(res.data.loans);
                setPagination(res.data.pagination);
            });
    }, [pagination.page, reload, filter.endDate, filter.startDate, filter.status]);

    return (
        <>
            <PageMeta title={`Peminjaman | ${import.meta.env.VITE_APP_NAME}`} description="" />
            <PageBreadcrumb pageTitle="Peminjaman" />

            <div className="space-y-6">
                <ComponentCard
                    title="Peminjaman"
                    option={
                        <div className="flex gap-4">
                            <Filter filter={filter} setFilter={setFilter} />
                            <Link to={"/loan/create"}>
                                <Button size="sm">Tambah Peminjaman</Button>
                            </Link>
                        </div>
                    }
                >
                    <Table
                        data={areas}
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
    console.log(status);

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
                                    : undefined
                            }
                            onChange={(date) => {
                                setStartDate(date[0].toISOString().slice(0, 19).replace("T", " "));
                                date[1]
                                    ? setEndDate(date[1].toISOString().slice(0, 19).replace("T", " "))
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

export default Loan;
