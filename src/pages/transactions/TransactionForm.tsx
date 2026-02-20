import React, { useEffect, useState } from "react";

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import * as yup from 'yup';

import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import SelectSearch from '../../components/form/SelectSearch';
import Input from "../../components/form/input/InputField";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { useUser } from "../../hooks/useUser";
import { ChevronLeftIcon } from "../../icons";
import axios from "../../utils/axios";
import { formatCurrency, toLocalDate, unformatCurrency } from "../../utils/helpers";
import { CategoryProps, MemberProps, UserProps } from "../../utils/types";
import TextArea from "../../components/form/input/TextArea";
import DatePicker from "../../components/form/date-picker";

interface TransactionFormInput {
    transaction_type: 'credit' | 'debit';
    category_id: string;
    description: string;
    nominal: string;
    pos_id: string;
    date: string;
    user?: number;
    reason?: string;
    resource?: string;
    date?: string;
}

const schema: yup.SchemaOf<TransactionFormInput> = yup.object({
    transaction_type: yup.string().required('Jenis transaksi wajib diisi'),
    category_id: yup.string().required('Kategori wajib diisi'),
    pos_id: yup.string().required('Pos wajib diisi'),
    description: yup.string().required('Keterangan wajib diisi'),
    nominal: yup.string().required('Nominal wajib diisi'),
    date: yup.string().required('Tanggal wajib diisi'),
});

const TransactionForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [anggota, setAnggota] = useState<{ label: string, value: string }[]>([]);
    const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(false);
    const [pos, setPos] = useState<{ label: string, value: string }[]>([]);

    const [hasAngsuran, setHasAngsuran] = useState(false);
    const [configLoan, setConfigLoan] = useState({
        totalBulan: 10,
        modalDo: 30
    });

    const { user } = useUser();
    const { id } = useParams();
    const isUpdate = !!id;

    const {
        register,
        handleSubmit,
        setError,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<TransactionFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            nominal: "0",
        }
    });

    const nominal = watch("nominal");

    useEffect(() => {
        const pinjaman = unformatCurrency(nominal.toString());


        // Validasi jika pinjaman dan bunga adalah angka
        if (!isNaN(pinjaman)) {

            // Set nilai hasil perhitungan ke form
            setValue("nominal", formatCurrency(pinjaman, false));


        }
    }, [nominal]);  // Hanya dipanggil jika jumlah_pinjaman atau persen_bunga berubah


    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            setLoading(true);
            axios.get("/api/transactions/" + id).then((res: any) => {
                const loan = res.data.transaction
                reset({ ...loan, nominal: loan.amount });
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }


        axios.get("/api/categories?limit=20000000").then(res => {
            setCategories(res.data.categories.map((user: CategoryProps) => ({ label: user.name, value: user.id })));
        });

        axios.get("/api/pos?limit=200000000").then(res => {
            setPos(res.data.pos.map((p: any) => ({ label: p.nama_pos, value: p.id })))
        });
    }, []);

    const onSubmit = async (data: TransactionFormInput) => {
        try {
            data.nominal = unformatCurrency(data.nominal).toString();
            data.user = user?.id;
            data.resource = "transaksi"
            let res;
            console.log(data);

            if (!id) {
                res = await axios.post("/api/transactions", data);
            } else {
                res = await axios.put("/api/transactions/" + id, data);
            }


            if (res.status === 201 || res.status === 200) {
                toast.success(`Transaksi berhasil ${!id ? "ditambah" : "diubah"}`);
                navigate("/transactions");
            }
        } catch (error: any) {
            console.error(error);
            console.log(error)
            if (error.status === 400 && error.response.data.errors) {
                Object.keys(error.response.data.errors).forEach((key: any) => {
                    setError(key as any, {
                        type: 'manual',
                        message: error.response.data.errors[key],
                    });
                });
            } else {
                setAlert("Terjadi kesalahan dengan server");
            }
        }
    };

    if (loading && isUpdate) return <Loading />;

    return (
        <>
            <PageMeta title={`${!id ? "Tambah Transaksi" : "Ubah Transaksi"} | ${import.meta.env.VITE_APP_NAME}`} description="" />
            <PageBreadcrumb pageTitle={!id ? "Tambah Transaksi" : "Ubah Transaksi"} />
            <div className="w-full mx-auto mb-2">
                <Link to="/transactions" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Transaksi
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <Alert variant="error" title="Pemberitahuan" message={alert} />}
                <ComponentCard title={!id ? "Tambah Transaksi" : "Ubah Transaksi"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <div>
                                <Label htmlFor="penanggung_jawab">Tanggal Input</Label>
                                <DatePicker
                                    id={"date"}
                                    mode="single"
                                    placeholder="Tanggal transaksi"
                                    defaultDate={getValues("date")}
                                    onChange={(date) => {
                                        setValue("date", toLocalDate(date[0]), { shouldDirty: true });
                                    }}
                                />
                                {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="pos_id">Pos</Label>
                                <SelectSearch
                                    label=""
                                    placeholder="Pilih pos"
                                    options={pos}
                                    defaultValue={getValues("pos_id")}
                                    {...register("pos_id")}
                                    onChange={(val: any) => setValue("pos_id", val)}
                                />
                                {errors.pos_id && <p className="text-sm text-red-500 mt-1">{errors.pos_id.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="category_id">Kategori</Label>
                                <SelectSearch
                                    label=""
                                    placeholder="Pilih kategori"
                                    options={categories}
                                    defaultValue={getValues("category_id")}
                                    {...register("category_id")}
                                    onChange={(val: any) => setValue("category_id", val)}
                                />
                                {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="transaction_type">Jenis Transaksi</Label>
                                <Select
                                    {...register("transaction_type")}
                                    options={[
                                        { label: "Kredit", value: "credit" },
                                        { label: "Debit", value: "debit" },
                                    ]}
                                    placeholder="Pilih Jenis Transaksi"
                                />
                                {errors.transaction_type && <p className="text-sm text-red-500 mt-1">{errors.transaction_type.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="nominal">Jumlah Nominal</Label>
                                <div className="relative">
                                    <Input id="nominal" type="text" {...register("nominal")} className="pl-[62px]" />
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        Rp
                                    </span>
                                </div>
                                {errors.nominal && <p className="text-sm text-red-500 mt-1">{errors.nominal.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="description">Keterangan</Label>
                                <Input id="description" type="text" {...register("description")} />
                                {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>}
                            </div>
                            {isUpdate && <div className="col-span-2">
                                <Label htmlFor="reason">Alasan Perubahan</Label>

                                <textarea className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden bg-transparent text-gray-900 dark:text-gray-300 text-gray-900 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"  {...register("reason")} placeholder="Alasan perubahan" rows={3}></textarea>
                                {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>}
                            </div>}
                        </div>
                        <Button size="sm" disabled={disabled}>Simpan</Button>
                    </Form>
                </ComponentCard>
            </div>
        </>
    );
};

export default TransactionForm;
