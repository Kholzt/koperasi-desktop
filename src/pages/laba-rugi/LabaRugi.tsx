import { yupResolver } from "@hookform/resolvers/yup";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import * as yup from 'yup';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import DatePicker from "../../components/form/date-picker";
import Input from "../../components/form/input/InputField";
import { Modal } from "../../components/ui/modal";
import { useUser } from "../../hooks/useUser";
import axios from "../../utils/axios";
import { formatCurrency, toLocalDate } from "../../utils/helpers";
import { getData } from "./getData";

const LabaRugi: React.FC = () => {
    const { filter, transactions, setFilter } = getData();


    const tableRef = useRef<HTMLDivElement>(null);

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
                    {/* <div className=" w-full">
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
                    </div> */}
                </div>
                <div className="grid md:grid-cols-3 grid-cols-1 gap-4 md:gap-6 ">

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        {/* <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                            <Icon className="text-gray-800 size-6 dark:text-white/90" />
                        </div> */}

                        <div className="flex items-end justify-between mt-5">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Debit
                                </span>
                                <h4 className="mt-2 font-bold text-green-600 text-title-sm dark:text-white/90">
                                    {formatCurrency(transactions[0]?.total_debit)}
                                </h4>
                            </div>

                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        {/* <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                            <Icon className="text-gray-800 size-6 dark:text-white/90" />
                        </div> */}

                        <div className="flex items-end justify-between mt-5">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Kredit
                                </span>
                                <h4 className="mt-2 font-bold text-red-600 text-title-sm dark:text-white/90">
                                    {formatCurrency(transactions[0]?.total_kredit)}
                                </h4>
                            </div>

                        </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
                        {/* <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                            <Icon className="text-gray-800 size-6 dark:text-white/90" />
                        </div> */}

                        <div className="flex items-end justify-between mt-5">
                            <div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Total
                                </span>
                                <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90 ">
                                    {formatCurrency(transactions[0]?.total)}
                                </h4>
                            </div>

                        </div>
                    </div>
                </div>

                {/* <ComponentCard
                    title="Laba Rugi"
                >
                    <Table
                        tableRef={tableRef}
                        data={transactions}
                    />

                    das
                </ComponentCard> */}
            </div>

            <Verification filter={filter} setFilter={setFilter} />

        </>
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
function Verification({ filter, setFilter }: { filter: any, setFilter: any }) {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(true);
    const [showFilterTanggal, setShowFilterTanggal] = useState(false);
    const { user } = useUser();
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
                setShowFilterTanggal(true)
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





    return <>
        <Modal
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
                            type="password"
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
        <FilterDate filter={filter} setOpen={setShowFilterTanggal} isOpen={showFilterTanggal} setFilter={setFilter} />
    </>
}

function FilterDate({ isOpen, filter, setFilter, setOpen }: { isOpen: any, setFilter: any, filter: any, setOpen: any }) {
    const closeModal = () => setOpen(false);







    return <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-6 lg:p-10"
    >
        <form>
            <div className=" flex flex-col px-2 overflow-y-auto custom-scrollbar normal-case">
                <div className="min-h-[500px]">
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        Pemberitahuan
                    </h5>
                    <p className="text-base text-gray-800 dark:text-gray-400 mb-6">
                        Silahkan pilih tanggal transaksi
                    </p>

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
                </div>

                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    <button
                        onClick={closeModal}
                        type="button"
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={() => setOpen(false)}
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                    >
                        Filter</button>
                </div>
            </div>
        </form>
    </Modal>
}
