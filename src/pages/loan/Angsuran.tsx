import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "react-toastify";
import * as yup from 'yup';
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import MultiSelect from "../../components/form/MultiSelect";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import Loading from "../../components/ui/Loading";
import Button from "../../components/ui/button/Button";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../hooks/useUser";
import axios from "../../utils/axios";
import { formatCurrency, insertToTransaction, toLocalDate, unformatCurrency } from "../../utils/helpers";
import { AngsuranProps, EmployeProps, UserProps } from "../../utils/types";
import { formatDate } from './../../utils/helpers';

interface FormInputs {
    asal_pembayaran: string | null;
    jumlah_bayar: string;
    jumlah_katrol: string;
    penagih: string[]; // atau number[] tergantung data
    status: "lunas" | "menunggak" | "kurang" | "lebih" | 'Libur Operasional' | "libur";
};

const schema: yup.SchemaOf<FormInputs> = yup.object({
    jumlah_bayar: yup.string()
        .required("Jumlah bayar wajib diisi"),
    penagih: yup.array().of(yup.string().trim()
        .min(1, 'Silahkan pilih penagih')
        .required('Silahkan pilih penagih'))
        .min(1, "Minimal pilih satu penagih")
        .required('Penagih wajib dipilih'),
    status: yup.mixed<"lunas" | "menunggak" | "kurang" | "lebih" | 'Libur Operasional' | "libur">()
        .oneOf(["lunas", "menunggak", "kurang", "lebih", 'Libur Operasional', "libur"], "Status tidak valid")
        .required("Status wajib diisi"),
});

const Angsuran: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [angsuran, setAngsuran] = useState<AngsuranProps | null>(null);
    const [staffs, setStaffs] = useState<{ text: string, value: string }[]>([]);
    const [employes, setEmployes] = useState<EmployeProps[]>([]);
    const { id, idAngsuran } = useParams();
    const [isLunas, setisLunas] = useState(false);
    const [totalPinjamanLama, setTotalPinjamanLama] = useState(0);
    const [loans, setLoans] = useState();
    const [originalData, setOriginalData] = useState<FormInputs>();


    const { user } = useUser();
    const { reload } = useTheme();
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`/api/loans/${id}`).then((res: any) => {
            setLoans(res.data.loan) // untuk menentukan sisa pembayaran

            if (!idAngsuran) setValue("jumlah_bayar", formatCurrency(res.data.loan.jumlah_angsuran), { shouldDirty: true });
        });

        axios.get("/api/employees?limit=20000000").then(res => {
            setEmployes(res.data.employees);

            setStaffs(res.data.employees.map((employe: UserProps) => ({ text: employe.complete_name, value: employe.id })))
        });
        if (idAngsuran) {
            setIsLoading(true)
            axios.get(`/api/angsuran/${idAngsuran}`).then((res: any) => {
                const { data: { angsuran } } = res;
                setAngsuran(angsuran)
                setTotalPinjamanLama(angsuran.jumlah_bayar + angsuran.jumlah_katrol)
                const initialData = {
                    jumlah_katrol: formatCurrency(angsuran.jumlah_katrol),
                    jumlah_bayar: formatCurrency(angsuran.jumlah_bayar),
                    asal_pembayaran: angsuran.asal_pembayaran,
                    status: angsuran.status,
                    penagih: angsuran.penagih.map((p: any) => p.id)
                }
                reset(initialData);
                setIsLoading(false)
                setOriginalData(initialData)
                // setTotalAngsuranLama(angsuran.jumlah_katrol + angsuran.jumlah_bayar)

            });
        } else {
            axios.get(`/api/angsuran/aktif/${id}`).then((res: any) => {
                setAngsuran(res.data.angsuran)
            });
        }
    }, [reload]);



    const { register, handleSubmit, setValue, getValues, watch, setError, formState: { errors, dirtyFields }, reset } = useForm<FormInputs>({
        resolver: yupResolver(schema),
        defaultValues: {
            jumlah_katrol: formatCurrency(0),
            // asal_pembayaran: "anggota"
        }
    });

    const lunasUpdate = watch("status")

    useEffect(() => {
        if (lunasUpdate) {
            const isLunasValue =
                lunasUpdate !== "menunggak" &&
                lunasUpdate !== "Libur Operasional" &&
                lunasUpdate !== "libur";

            setisLunas(isLunasValue);

            // hanya reset asal_pembayaran jika memang tidak relevan
            if (!isLunasValue) {
                setValue("asal_pembayaran", null, { shouldDirty: true });
            }
        }
    }, [lunasUpdate]);

    const jumlahBayar = watch("jumlah_bayar");
    const jumlahKatrol = watch("jumlah_katrol");
    const asalPembayaran = watch("asal_pembayaran");

    useEffect(() => {
        if (jumlahBayar) {
            const jumlahBayarFormat = unformatCurrency(jumlahBayar);
            setValue("jumlah_bayar", formatCurrency(jumlahBayarFormat), { shouldDirty: true });
        }
        if (jumlahKatrol) {
            const jumlahKatrolFormat = unformatCurrency(jumlahKatrol);
            setValue("jumlah_katrol", formatCurrency(jumlahKatrolFormat), { shouldDirty: true });
        }
    }, [jumlahBayar, jumlahKatrol]);
    const onSubmit = async (data: FormInputs) => {
        let meta: any = {};
        Object.keys(dirtyFields).forEach((key: string) => {
            meta[key] = originalData
                ? { original: originalData[key], updated: data[key] }
                : { original: data[key], updated: "-" };
        });


        let reason;
        let status;
        try {
            const cleanNumber = (value: any) => {
                const cleaned = String(value).replace(/[^0-9]/g, "");
                return cleaned === "" ? 0 : parseInt(cleaned, 10);
            };

            const jumlahBayar = cleanNumber(data.jumlah_bayar);
            const sisaPembayaran = cleanNumber(loans?.sisa_pembayaran);
            console.log("jumlahBayar:", jumlahBayar);
            console.log("sisaPembayaran:", sisaPembayaran);
            if (jumlahBayar > sisaPembayaran) {
                console.log('lebih', parseInt(data.jumlah_bayar.replace(/[^0-9]/g, "")));
                console.log(`sisa`, parseInt(String(loans?.sisa_pembayaran)));
                setError("jumlah_bayar", {
                    type: "manual",
                    message: "Jumlah pembayaran tidak boleh melebihi sisa pembayaran"
                })
                return;
            }
            if (!data.asal_pembayaran && (data.status != "menunggak" && data.status != "Libur Operasional" && data.status != "libur")) return setError("asal_pembayaran", {
                type: "required",
                message: "Asal pembayaran wajib diisi"
            })
            let res;
            if (!idAngsuran) {
                reason = "add angsuran"
                status = "add"
                res = await axios.post(`/api/angsuran/${id}`, { ...data, jumlah_bayar: ["Libur Operasional", "Libur Operasional"].includes(data.status) ? 0 : unformatCurrency(data.jumlah_bayar), jumlah_katrol: unformatCurrency(data.jumlah_katrol ?? "0") });
            } else {
                reason = "edit angsuran"
                status = "edit"
                res = await axios.put(`/api/angsuran/${idAngsuran}`, { ...data, jumlah_bayar: ["Libur Operasional", "Libur Operasional"].includes(data.status) ? 0 : unformatCurrency(data.jumlah_bayar), jumlah_katrol: unformatCurrency(data.jumlah_katrol ?? "0") });
            }
            if (res.status === 201 || res.status === 200) {
                const description = employes.find((e) => data.penagih.includes(e.id.toString()))?.group_name
                if (data.status != "Libur Operasional" && data.status != "libur") {
                    const jumlahBayar = unformatCurrency(data.jumlah_bayar ?? "0") + unformatCurrency(data.jumlah_katrol ?? "0");
                    const nominal = totalPinjamanLama > jumlahBayar ? -(totalPinjamanLama - jumlahBayar) : jumlahBayar - totalPinjamanLama;
                    const dataTransaction = {
                        transaction_type: 'debit',
                        category_id: 1,
                        description: description ?? "Kelompok 0",
                        nominal: nominal,
                        pos_id: user?.pos_id,
                        user: user?.id ?? null,
                        resource: "angsuran",
                        meta: JSON.stringify(meta),
                        reason: reason,
                        status: status,
                        date: angsuran?.tanggal_pembayaran ? toLocalDate(new Date(angsuran?.tanggal_pembayaran)) : toLocalDate(new Date())
                    }
                    // await axios.post("/api/transactions", dataTransaction);


                }
                toast.success("Angsuran berhasil diubah")
                navigate("/loan?isFromTransaction=true");
            }
        } catch (error) {
            toast.error("Angsuran gagal diubah")
            console.log(data);
            console.log(error);

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
                    <h2 className="dark:text-white">Angsuran tanggal : {formatDate(angsuran?.tanggal_pembayaran ?? "")}</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className={` py-4 px-4 rounded-sm`}>
                        <div className="grid grid-cols-2 gap-4 mb-4" >
                            <div className="col-span-2">
                                <Label>Jumlah bayar</Label>
                                <Input type="text" {...register("jumlah_bayar")} />
                                {errors.jumlah_bayar && typeof errors.jumlah_bayar?.message === 'string' && (
                                    <p className="mt-1 text-sm text-red-500">{errors.jumlah_bayar?.message}</p>
                                )}
                            </div>

                            <div  >
                                <Label>Penagih</Label>
                                <MultiSelect
                                    readOnly={!!idAngsuran}
                                    label=""
                                    placeholder="Pilih penagih"
                                    options={staffs}
                                    defaultSelected={getValues("penagih") ?? []}
                                    {...register("penagih")}
                                    onChange={(val) => setValue("penagih", val, { shouldDirty: true })}
                                />
                                {errors.penagih && typeof errors.penagih?.message === 'string' && (
                                    <p className="mt-1 text-sm text-red-500">{errors.penagih?.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>Status</Label>
                                <Select
                                    readOnly={!!idAngsuran}
                                    options={[
                                        { label: "Lunas", value: "lunas" },
                                        { label: "Menunggak", value: "menunggak" },
                                        { label: "Lebih", value: "lebih" },
                                        { label: "Kurang", value: "kurang" },
                                        { label: 'Libur Operasional', value: 'Libur Operasional' },
                                        { label: 'Libur', value: 'libur' },
                                    ]} placeholder="Pilih status angsuran" {...register("status")} />
                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                                )}
                            </div>
                            {isLunas && <div>
                                <Label>Asal Pembayaran</Label>
                                <Select
                                    readOnly={!!idAngsuran}
                                    options={[
                                        { label: "Anggota", value: "anggota" },
                                        { label: "Penagih", value: "penagih" },
                                        { label: "Katrol", value: "katrol" },
                                    ]} placeholder="Pilih asal pembayaran" {...register("asal_pembayaran")} />
                                {errors.asal_pembayaran && (
                                    <p className="mt-1 text-sm text-red-500">{errors.asal_pembayaran.message}</p>
                                )}
                            </div>}
                            {asalPembayaran == "katrol" && <div >
                                <Label>Jumlah katrol</Label>
                                <Input type="text" {...register("jumlah_katrol")} />
                            </div>}

                        </div>
                        <div className="flex gap-2 place-content-end">
                            <Link
                                to={"/loan?isFromTransaction=true"}
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
