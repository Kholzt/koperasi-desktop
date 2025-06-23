import React, { FormEvent, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Pagination from "../../components/tables/BasicTables/Pagination";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import { useTheme } from "../../context/ThemeContext";
import axios from "../../utils/axios";
import { formatCurrency, formatDate, formatLongDate, isDatePassed, unformatCurrency } from "../../utils/helpers";
import { AngsuranProps, LoanProps, PaginationProps, UserProps } from "../../utils/types";
import MultiSelect from "../../components/form/MultiSelect";
import Select from "../../components/form/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { toast } from "react-toastify";
import { Link, useNavigate, useParams } from "react-router";
import Loading from "../../components/ui/Loading";


interface FormInputs {
    asal_pembayaran: string;
    jumlah_bayar: string;
    penagih: string[]; // atau number[] tergantung data
    status: "lunas" | "menunggak" | "kurang" | "lebih";
};

const schema: yup.SchemaOf<FormInputs> = yup.object({
    jumlah_bayar: yup.string()
        .required("Jumlah bayar wajib diisi"),
    penagih: yup.array().of(yup.string().trim()
        .min(1, 'Silahkan pilih penagih')
        .required('Silahkan pilih penagih'))
        .min(1, "Minimal pilih satu penagih")
        .required('Penagih wajib dipilih'),
    status: yup.mixed<"lunas" | "menunggak" | "kurang" | "lebih">()
        .oneOf(["lunas", "menunggak", "kurang", "lebih"], "Status tidak valid")
        .required("Status wajib diisi"),
});

const Angsuran: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [loans, setLoans] = useState<LoanProps | null>(null);
    const [angsuran, setAngsuran] = useState<AngsuranProps | null>(null);
    const [staffs, setStaffs] = useState<{ text: string, value: string }[]>([]);
    const { id, idAngsuran } = useParams();
    const [isLunas, setisLunas] = useState(false);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0
    });
    const { reload } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/api/loans/${id}`).then((res: any) => {
            setLoans(res.data.loan)
            reset({ jumlah_bayar: formatCurrency(res.data.loan.jumlah_angsuran) })
        });
        axios.get("/api/employees?limit=2000").then(res => {
            setStaffs(res.data.employees.map((employe: UserProps) => ({ text: employe.complete_name, value: employe.id })))
        });
    }, [pagination.page, reload]);

    useEffect(() => {
        if (idAngsuran) {
            axios.get(`/api/angsuran/${idAngsuran}`).then((res: any) => {
                const { data: { angsuran } } = res;
                reset({ asal_pembayaran: angsuran.asal_pembayaran, status: angsuran.status, penagih: angsuran.penagih.map((p: any) => p.id) });
                console.log(angsuran);
                setIsLoading(false)
            });
        }
    }, [idAngsuran, reload]);


    const { register, handleSubmit, setValue, getValues, watch, setError, formState: { errors }, reset } = useForm<FormInputs>({
        resolver: yupResolver(schema),
    });

    const lunasUpdate = watch("status")

    useEffect(() => {
        setisLunas(lunasUpdate != "menunggak")
    }, [lunasUpdate]);

    const jumlahBayar = watch("jumlah_bayar");

    useEffect(() => {
        if (jumlahBayar) {
            const jumlahBayarFormat = unformatCurrency(jumlahBayar);
            setValue("jumlah_bayar", formatCurrency(jumlahBayarFormat));
        }
    }, [jumlahBayar]);
    const onSubmit = async (data: FormInputs) => {
        try {
            if (data.asal_pembayaran == null && data.status == "lunas") return setError("asal_pembayaran", {
                type: "required",
                message: "Asal pembayaran wajib diisi"
            })

            if (!idAngsuran) {
                const res = await axios.post(`/api/angsuran/${id}`, { ...data, jumlah_bayar: unformatCurrency(data.jumlah_bayar) });
                toast.success("Angsuran berhasil diubah")
            } else {
                const res = await axios.put(`/api/angsuran/${idAngsuran}`, { ...data, jumlah_bayar: unformatCurrency(data.jumlah_bayar) });
                toast.success("Angsuran berhasil diubah")
            }
            navigate("/loan");
        } catch (error) {
            toast.error("Angsuran gagal diubah")
        }
    };


    if (isLoading && !!idAngsuran) return <Loading />
    return (
        <>
            <PageMeta
                title={`Angsuran | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle="Angsuran" />

            <div className="space-y-6">
                <ComponentCard title="Angsuran" >
                    <form onSubmit={handleSubmit(onSubmit)} className={` py-4 px-4 rounded-sm`}>
                        <div className="grid grid-cols-2 gap-4 mb-4" >
                            <div className="col-span-2">
                                <Label>Jumlah bayar</Label>
                                <Input readOnly={!!idAngsuran} type="text" {...register("jumlah_bayar")} defaultValue={formatCurrency(loans?.jumlah_angsuran)} />
                            </div>

                            <div  >
                                <Label>Penagih</Label>
                                <MultiSelect
                                    label=""
                                    placeholder="Pilih penagih"
                                    options={staffs}
                                    defaultSelected={getValues("penagih") ?? []}
                                    {...register("penagih")}
                                    onChange={(val) => setValue("penagih", val)}
                                />
                                {errors.penagih && typeof errors.penagih?.message === 'string' && (
                                    <p className="mt-1 text-sm text-red-500">{errors.penagih?.message}</p>
                                )}
                            </div>
                            {!idAngsuran && <div>
                                <Label>Status</Label>
                                <Select

                                    options={[
                                        { label: "Lunas", value: "lunas" },
                                        { label: "Menunggak", value: "menunggak" },
                                        { label: "Kurang", value: "kurang" },
                                        { label: "Lebih", value: "lebih" }
                                    ]} placeholder="Pilih status angsuran" {...register("status")} />
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                                )}
                            </div>}
                            {isLunas && <div>
                                <Label>Asal Pembayaran</Label>
                                <Select

                                    options={[
                                        { label: "Anggota", value: "anggota" },
                                        { label: "Penagih", value: "penagih" }
                                    ]} placeholder="Pilih asal pembayaran" {...register("asal_pembayaran")} />
                                {errors.asal_pembayaran && (
                                    <p className="mt-1 text-sm text-red-500">{errors.asal_pembayaran.message}</p>
                                )}
                            </div>}

                        </div>
                        <div className="flex gap-2 place-content-end">
                            <Link
                                to={"/loan"}
                            >
                                <Button variant="outline">Batal</Button>
                            </Link>
                            <Button
                                size="sm"
                                type="submit"
                            >
                                Simpan
                            </Button>

                        </div>
                    </form>
                </ComponentCard>

            </div>
        </>
    );
}










export default Angsuran;
