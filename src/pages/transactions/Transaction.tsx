import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import MultiSelect from "../../components/form/MultiSelect";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { useTheme } from "../../context/ThemeContext";
import axios from "../../utils/axios";
import { toLocalDate } from "../../utils/helpers";
import { CategoryProps, GroupProps, PosProps, TransactionProps } from "../../utils/types";
import ExportPDF from "./ExportPDF";
import Table from "./TransactionTable";
import ReactDOMServer from 'react-dom/server';
import SelectSearch from "../../components/form/SelectSearch";
import { useUser } from "../../hooks/useUser";


const Transaction: React.FC = () => {
    const [filter, setFilter] = useState<{ categories: string[], transaction_type: string[], groups: string[], pos: string | null, date: { startDate: string | null, endDate: string | null } }>({
        categories: [],
        pos: null,
        transaction_type: [],
        groups: [],
        date: { startDate: toLocalDate(new Date()), endDate: null },
    });
    const [transactions, setTransactions] = useState<TransactionProps[]>([]);
    const [categories, setCategories] = useState<{ text: string, value: string }[]>([]);
    const [groups, setGroups] = useState<{ text: string, value: string }[]>([]);
    const [pos, setPos] = useState<{ label: string, value: string }[]>([]);
    const [isAngsuran, setIsAngsuran] = useState(false);
    const { reload } = useTheme();
    const { user: userLogin } = useUser();
    useEffect(() => {
        const params = {
            startDate: filter.date.startDate ?? toLocalDate(new Date()),
            endDate: filter.date.endDate,
            categories: filter.categories, // array
            transaction_type: filter.transaction_type, // array
            groups: filter.groups,
            pos: filter.pos,
            isPusatAdmin: userLogin?.role == "pusat" || userLogin?.role == "super admin"
        };

        axios
            .get('/api/transactions', { params })
            .then((res: any) => {
                setTransactions(res.data.transactions);
            });



        axios
            .get(`/api/categories?limit=20000000`)
            .then((res: any) => {
                setCategories(res.data.categories.map((category: CategoryProps) => ({ text: category.name, value: category.id })))
            });
        axios
            .get(`/api/pos?limit=20000000`)
            .then((res: any) => {
                setPos(res.data.pos.map((p: PosProps) => ({ label: p.nama_pos, value: p.id })))
            });
        axios
            .get(`/api/getGroupsTransaction`)
            .then((res: any) => {
                console.log(res);
                setGroups(res.data.groups.map((group: any) => ({ text: group.description, value: group.description })))
            });
    }, [reload, filter]);

    const searchAction = (e: any) => {
        const value = e.target.value;
    }

    const tableRef = useRef<HTMLDivElement>(null);

    const handleExportPDF = async () => {
        const formatDate = filter.date.endDate ? filter.date.startDate + " - " + filter.date.endDate : filter.date.startDate;
        const htmlString = ReactDOMServer.renderToStaticMarkup(<ExportPDF date={formatDate ?? toLocalDate(new Date())} data={transactions} />);
        await window.ipcRenderer.savePDF("Laporan Keuangan - " + formatDate, htmlString);
    };


    const angsuranId = categories.find(c => c.text.includes("angsuran"))?.value;
    return (
        <>
            <PageMeta title={`Transaksi | ${import.meta.env.VITE_APP_NAME}`} description="" />
            <PageBreadcrumb pageTitle="Transaksi" />

            <div className="">
                <div className="grid grid-cols-4 gap-2  items-center mb-6">
                    <div className=" w-full">
                        <Label>Tanggal</Label>
                        <DatePicker
                            id={"startDate"}
                            mode="range"
                            placeholder="Tanggal transaksi"
                            defaultDate={
                                filter.date.startDate && filter.date.endDate
                                    ? [new Date(filter.date.startDate as string), new Date(filter.date.endDate as string)]
                                    : (filter.date.startDate ? [new Date(filter.date.startDate as string)] : undefined)
                            }
                            onChange={(date) => {
                                setFilter({ ...filter, date: { startDate: toLocalDate(date[0]), endDate: filter.date.endDate } });
                                date[1]
                                    ? setFilter({ ...filter, date: { startDate: toLocalDate(date[0]), endDate: toLocalDate(date[1]) } })
                                    : setFilter({ ...filter, date: { startDate: toLocalDate(date[0]), endDate: null } });
                            }}
                        />
                    </div>
                    <div className=" w-full">
                        <Label>Pos</Label>
                        <SelectSearch
                            label=""
                            placeholder="Pilih pos"
                            options={pos}
                            defaultValue={filter.pos ?? undefined}
                            onChange={(val: any) => setFilter({ ...filter, pos: val })}
                        />

                    </div>
                    <div className=" w-full">
                        <Label>Kategori</Label>
                        <MultiSelect
                            label=""
                            placeholder="Pilih kategori"
                            options={categories}
                            defaultSelected={filter.categories}
                            onChange={(val) => {
                                setFilter({ ...filter, categories: val })
                                setIsAngsuran(val.includes(angsuranId ?? ""))
                            }}
                        />
                    </div>
                    {isAngsuran && <div className=" w-full">
                        <Label>Kelompok</Label>
                        <MultiSelect
                            label=""
                            placeholder="Pilih kelompok"
                            options={groups}
                            defaultSelected={filter.groups}
                            onChange={(val) => setFilter({ ...filter, groups: val })}
                        />
                    </div>}
                    <div className=" w-full">
                        <Label>Jenis Transaksi</Label>
                        <MultiSelect
                            label=""
                            placeholder="Pilih jenis transaksi"
                            options={[{ text: "Debit", value: "debit" }, { text: "Kredit", value: "credit" }]}
                            defaultSelected={filter.transaction_type}
                            onChange={(val) => setFilter({ ...filter, transaction_type: val })}
                        />
                    </div>
                </div>

                <ComponentCard
                    title="Transaksi"
                    option={
                        <div className="flex gap-4 ">
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
                            <Button size="sm" onClick={handleExportPDF}>Export PDF</Button>
                            <Link to={"/transactions/create"}>
                                <Button size="sm">Tambah Transaksi</Button>
                            </Link>
                        </div>
                    }
                >
                    <Table
                        tableRef={tableRef}
                        data={transactions}
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
