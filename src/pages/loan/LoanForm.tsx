import React, { useEffect, useState } from "react";

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import * as yup from 'yup';

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { useUser } from "../../hooks/useUser";
import { ChevronLeftIcon } from "../../icons";
import axios from "../../utils/axios";
import { formatCurrency, unformatCurrency } from "../../utils/helpers";
import { MemberProps, UserProps } from "../../utils/types";
import { toast } from "react-toastify";
import Loading from "../../components/ui/Loading"

interface LoanFormInput {
    kode: string;
    jumlah_pinjaman: string;
    persen_bunga: string;
    total_bunga: string;
    anggota_id: string;
    total_pinjaman: string;
    total_pinjaman_diterima: string;
    jumlah_angsuran: string;
    tanggal_angsuran_pertama?: string;
    modal_do: string;
    penanggung_jawab: string;
    petugas_input: number;
    sisa_pembayaran: string;
    besar_tunggakan: string;
    status: 'aktif' | 'lunas' | 'menunggak';
}

const schema: yup.SchemaOf<LoanFormInput> = yup.object({
    kode: yup.string().required('Kode wajib diisi'),
    jumlah_pinjaman: yup.string().required('Jumlah pinjaman wajib diisi').min(0),
    total_pinjaman_diterima: yup.string().required('Jumlah pinjaman wajib diisi').min(0),
    persen_bunga: yup.number().required('Persen bunga wajib diisi').min(0).max(100),
    total_bunga: yup.string().required('Total bunga wajib diisi').min(0).max(100),
    anggota_id: yup.string().required('Anggota wajib dipilih'),
    total_pinjaman: yup.string().required(),
    jumlah_angsuran: yup.string().required(),
    modal_do: yup.string().required('Modal DO wajib diisi').min(0),
    penanggung_jawab: yup.string().required('Penanggung jawab wajib dipilih'),
    status: yup
        .mixed<'aktif' | 'lunas' | 'menunggak'>()
        .oneOf(['aktif', 'lunas', 'menunggak'], 'Status harus salah satu dari: aktif, lunas, atau menunggak')
        .required('Status wajib dipilih'),
});

const LoanForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [anggota, setAnggota] = useState<{ label: string, value: string }[]>([]);
    const [users, setUsers] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [disabled, setDisabled] = useState(false);
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
        formState: { errors }
    } = useForm<LoanFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            jumlah_angsuran: "0",
            jumlah_pinjaman: "0",
            persen_bunga: "30",
            total_pinjaman: "0",
            modal_do: "0",
            sisa_pembayaran: "0",
            besar_tunggakan: "0"
        }
    });

    const jumlah_pinjaman = watch("jumlah_pinjaman");
    const persen_bunga = watch("persen_bunga");
    const anggotaId = watch("anggota_id");

    useEffect(() => {
        // Unformat nilai pinjaman dan bunga
        const pinjaman = unformatCurrency(jumlah_pinjaman.toString());
        // let persenBungaSplit = persen_bunga.split(",");
        // const persenBungaFormat = persenBungaSplit.length > 2 ? persenBungaSplit[0] + "," + persenBungaSplit[1] : persen_bunga;
        let bunga = parseFloat(persen_bunga.replace(",", '.'));  // Unformat input bunga
        // console.log(persenBungaSplit);

        // Validasi jika pinjaman dan bunga adalah angka
        if (!isNaN(pinjaman) && !isNaN(bunga)) {
            // Ambil konfigurasi dari environment
            const totalBulanAngsuran = configLoan.totalBulan;
            const modalDoPersen = configLoan.modalDo;
            // Hitung total bunga, total pinjaman, angsuran per bulan, dll.
            const totalBunga = (pinjaman * bunga / 100);
            const total = pinjaman + totalBunga;
            const angsuran = parseFloat((total / totalBulanAngsuran).toFixed(2));
            const modalDo = (pinjaman * (modalDoPersen / 100));
            const totalTerima = pinjaman - modalDo;

            // Set nilai hasil perhitungan ke form
            setValue("total_pinjaman", formatCurrency(total, false));
            setValue("jumlah_angsuran", formatCurrency(angsuran, false));
            setValue("jumlah_pinjaman", formatCurrency(pinjaman, false));
            setValue("total_bunga", formatCurrency(totalBunga, false));
            setValue("total_pinjaman_diterima", formatCurrency(totalTerima, false));
            setValue("modal_do", formatCurrency(modalDo, false));




            // Validasi bunga
            if (isNaN(bunga) || bunga < 0) {
                setValue("persen_bunga", "0");  // Nilai negatif dianggap 0
            } else if (bunga > 100) {
                setValue("persen_bunga", "100");  // Nilai lebih dari 100 dianggap 100
            } else {
                const persenStr = persen_bunga.toString();
                const komaCount = (persenStr.match(/,/g) || []).length;
                const titikCount = (persenStr.match(/\./g) || []).length;

                if (komaCount <= 1 && titikCount <= 1) {
                    setValue("persen_bunga", persenStr.replace(",", "."));
                } else {
                    setValue("persen_bunga", persenStr.replace(",", ".").slice(0, -1));

                }
            }
        }
    }, [jumlah_pinjaman, persen_bunga]);  // Hanya dipanggil jika jumlah_pinjaman atau persen_bunga berubah


    //get code peminjaman
    useEffect(() => {
        if (anggotaId && !isUpdate) {
            axios.get("/api/loans/" + anggotaId + "/code").then(res => {
                setValue("kode", res.data.code);
            });
            axios.get("/api/loans/" + anggotaId + "/status-pinjaman").then(res => {
                let pesan = "";
                setDisabled(false)
                if (res.data.punyaTunggakan) {
                    pesan = "Pengguna masih memiliki tunggakan";
                    setDisabled(true)
                }
                setError("anggota_id", {
                    type: 'manual',
                    message: pesan,
                })
            });
        }
    }, [anggotaId]);
    const navigate = useNavigate();

    useEffect(() => {
        if (id) {
            setLoading(true);

            console.log(id);
            axios.get("/api/loans/" + id).then(res => {
                const loan = res.data.loan
                reset({ ...loan, besar_tunggakan: loan.besar_tunggakan.toString(), sisa_pembayaran: loan.sisa_pembayaran.toString() });

                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }
        axios.get("/api/configLoan").then(res => {
            setConfigLoan(res.data.config);
        });
        axios.get("/api/members?limit=2000").then(res => {
            setAnggota(res.data.members.map((member: MemberProps) => ({ label: member.complete_name, value: member.id })));
        });
        axios.get("/api/employees?limit=2000").then(res => {
            setUsers(res.data.employees.map((user: UserProps) => ({ label: user.complete_name, value: user.id })));
        });
    }, []);

    const onSubmit = async (data: LoanFormInput) => {
        try {
            console.log(data);
            data.besar_tunggakan = unformatCurrency(data.besar_tunggakan).toString();
            data.jumlah_angsuran = unformatCurrency(data.jumlah_angsuran).toString();
            data.jumlah_pinjaman = unformatCurrency(data.jumlah_pinjaman).toString();
            data.total_pinjaman = unformatCurrency(data.total_pinjaman).toString();
            data.total_pinjaman_diterima = unformatCurrency(data.total_pinjaman_diterima).toString();
            data.modal_do = unformatCurrency(data.modal_do).toString();
            data.total_bunga = unformatCurrency(data.total_bunga).toString();
            data.petugas_input = user?.id ?? 1;

            let res;
            if (!id) {
                res = await axios.post("/api/loans", data);
            } else {
                res = await axios.put("/api/loans/" + id, data);
            }

            if (res.status === 201 || res.status === 200) {
                toast.success(`Pinjaman berhasil ${!id ? "ditambah" : "diubah"}`);
                navigate("/loan");
            }
        } catch (error: any) {
            console.error(error);
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
            <PageMeta title={`${!id ? "Tambah Peminjaman" : "Ubah Peminjaman"} | ${import.meta.env.VITE_APP_NAME}`} description="" />
            <PageBreadcrumb pageTitle={!id ? "Tambah Peminjaman" : "Ubah Peminjaman"} />
            <div className="w-full mx-auto mb-2">
                <Link to="/loan" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Peminjaman
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <Alert variant="error" title="Pemberitahuan" message={alert} />}
                <ComponentCard title={!id ? "Tambah Peminjaman" : "Ubah Peminjaman"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <div>
                                <Label htmlFor="anggota_id">Anggota</Label>
                                <Select disabled={isUpdate} options={anggota} {...register("anggota_id")} placeholder="Pilih anggota" />
                                {errors.anggota_id && <p className="text-sm text-red-500 mt-1">{errors.anggota_id.message}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="kode">Kode</Label>
                                <Input readOnly id="kode" {...register("kode")} placeholder="Masukkan kode pinjaman" />
                                {errors.kode && <p className="text-sm text-red-500 mt-1">{errors.kode.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="jumlah_pinjaman">Jumlah Pinjaman</Label>
                                <div className="relative">
                                    <Input id="jumlah_pinjaman" type="text" {...register("jumlah_pinjaman")} className="pl-[62px]" />
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        Rp
                                    </span>
                                </div>
                                {errors.jumlah_pinjaman && <p className="text-sm text-red-500 mt-1">{errors.jumlah_pinjaman.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="persen_bunga">Persen Bunga (%)</Label>
                                <div className="relative">
                                    <Input id="persen_bunga" maxLength={5} readOnly value={30} type="text" {...register("persen_bunga")} className="pl-[62px]" />
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        %
                                    </span>
                                </div>
                                {errors.persen_bunga && <p className="text-sm text-red-500 mt-1">{errors.persen_bunga.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="persen_bunga">Total Bunga</Label>
                                <div className="relative">
                                    <Input readOnly id="total_bunga" maxLength={3} type="text" {...register("total_bunga")} className="pl-[62px]" />
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        Rp
                                    </span>
                                </div>
                                {errors.total_bunga && <p className="text-sm text-red-500 mt-1">{errors.total_bunga.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="total_pinjaman">Total Pinjaman Diterima</Label>
                                <div className="relative">
                                    <Input hint="Total pinjaman yang diterima anggota" id="total_pinjaman_diterima" type="text" readOnly {...register("total_pinjaman_diterima")} className="pl-[62px]" />
                                    <span className="absolute left-0 top-[35%] -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        Rp
                                    </span>
                                </div>
                                {errors.total_pinjaman_diterima && <p className="text-sm text-red-500 mt-1">{errors.total_pinjaman_diterima.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="total_pinjaman">Total Pinjaman</Label>
                                <div className="relative">
                                    <Input hint="Total pinjaman yang harus dikembalikan anggota" id="total_pinjaman" type="text" readOnly {...register("total_pinjaman")} className="pl-[62px]" />
                                    <span className="absolute left-0 top-[35%] -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        Rp
                                    </span>
                                </div>
                                {errors.total_pinjaman && <p className="text-sm text-red-500 mt-1">{errors.total_pinjaman.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="jumlah_angsuran">Jumlah Angsuran</Label>
                                <div className="relative">
                                    <Input id="jumlah_angsuran" type="text" readOnly {...register("jumlah_angsuran")} className="pl-[62px]" />
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        Rp
                                    </span>
                                </div>
                                {errors.jumlah_angsuran && <p className="text-sm text-red-500 mt-1">{errors.jumlah_angsuran.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="modal_do">Modal DO</Label>
                                <div className="relative">
                                    <Input readOnly id="modal_do" type="text" {...register("modal_do")} className="pl-[62px]" />
                                    <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                                        Rp
                                    </span>
                                </div>
                                {errors.modal_do && <p className="text-sm text-red-500 mt-1">{errors.modal_do.message}</p>}
                            </div>



                            <div>
                                <Label htmlFor="penanggung_jawab">Penanggung Jawab</Label>
                                <Select options={users} {...register("penanggung_jawab")} placeholder="Pilih penanggung jawab" />
                                {errors.penanggung_jawab && <p className="text-sm text-red-500 mt-1">{errors.penanggung_jawab.message}</p>}
                            </div>


                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    {...register("status")}
                                    options={[
                                        { label: "Aktif", value: "aktif" },
                                        { label: "Lunas", value: "lunas" },
                                        { label: "Menunggak", value: "menunggak" }
                                    ]}
                                    placeholder="Pilih status"
                                />
                                {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status.message}</p>}
                            </div>
                        </div>

                        <Button size="sm" disabled={disabled}>Simpan</Button>
                    </Form>
                </ComponentCard>
            </div>
        </>
    );
};

export default LoanForm;
