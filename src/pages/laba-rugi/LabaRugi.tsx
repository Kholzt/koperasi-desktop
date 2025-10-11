import React, { useRef, useState } from "react";
import ReactDOMServer from 'react-dom/server';
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import MultiSelect from "../../components/form/MultiSelect";
import Select from "../../components/form/Select";
import SelectSearch from "../../components/form/SelectSearch";
import DatePicker from "../../components/form/date-picker";
import Button from "../../components/ui/button/Button";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { toLocalDate } from "../../utils/helpers";
import ExportPDF from "./ExportPDF";
import Table from "./TransactionTable";
import { getData } from "./getData";
import { Modal } from "../../components/ui/modal";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import Input from "../../components/form/input/InputField";
import axios from "../../utils/axios";
import { useUser } from "../../hooks/useUser";

const LabaRugi: React.FC = () => {
    const { filter, transactions, categories, groups, setFilter, pos, isAngsuran, setIsAngsuran } = getData();


    const tableRef = useRef<HTMLDivElement>(null);

    const handleExportPDF = async () => {
        const formatDate = filter.date.endDate ? filter.date.startDate + " - " + filter.date.endDate : filter.date.startDate;
        const htmlString = ReactDOMServer.renderToStaticMarkup(<ExportPDF date={formatDate ?? toLocalDate(new Date())} data={transactions} />);
        await window.ipcRenderer.savePDF("Laporan Keuangan - " + formatDate, htmlString);
    };


    const angsuranId = categories.find(c => c.text.includes("angsuran"))?.value;
    return (
        <>
            <PageMeta title={`Laba Rugi | ${import.meta.env.VITE_APP_NAME}`} description="" />
            <PageBreadcrumb pageTitle="Laba Rugi" />

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
                    title="Laba Rugi"
                // option={
                //     <div className="flex gap-4 ">
                //         <Button size="sm" onClick={handleExportPDF}>Export PDF</Button>
                //     </div>
                // }
                >
                    <Table
                        tableRef={tableRef}
                        data={transactions}
                    />

                </ComponentCard>
            </div>

            <Verification />

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

export default LabaRugi;



interface FormInput {
    password: string;
    username: string;
}


const schema: yup.SchemaOf<FormInput> = yup.object({
    password: yup.string().required('Kata sandi wajib diisi'),
});
function Verification() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const { user } = useUser();
    const [message, setMessage] = useState<null | string>(null);
    const closeModal = () => navigate(-1);

    const {
        register,
        handleSubmit,
        setError,
        reset,
        watch,
        getValues, setValue,
        formState: { errors }
    } = useForm<FormInput>({
        resolver: yupResolver(schema)
    });

    const verification = async (data: FormInput) => {

        try {
            data.username = user?.username ?? "";
            const res = await axios.post("/api/login",
                data
            );

            if (res.status === 200) {
                setIsOpen(false);
            } else {

            }
        } catch (error: any) {

            if (error.status === 404) {
                setError("password", {
                    type: 'manual',
                    message: "Kata sandi salah", // Pesan error dari response
                });
            } else if (error.response.data.error.sqlState == "28000") {

            }
        }
    }





    return <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-6 lg:p-10"
    >
        <form onSubmit={handleSubmit(verification)}>
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar normal-case">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        Pemberitahuan
                    </h5>
                    <p className="text-base text-gray-800 dark:text-gray-400 mb-6">
                        Masukkan kata sandi anda untuk melihat laba rugi
                    </p>
                    {/* <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Data yang dihapus dapat dikembalikan nanti
                </p> */}

                    <Label htmlFor="reason">Kata sandi</Label>
                    <Input
                        placeholder="Masukkan kata sandi"
                        {...register("password")}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                    )}                </div>

                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    <button
                        onClick={closeModal}
                        type="button"
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                    >
                        Tutup
                    </button>
                    <button
                        type="submit"
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                    >
                        Buka</button>
                </div>
            </div>
        </form>
    </Modal>
}
