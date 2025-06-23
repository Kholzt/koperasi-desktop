import React, { useEffect, useState } from "react";

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from 'react-toastify';
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
import { ChevronLeftIcon } from "../../icons";
import axios from "../../utils/axios";
import Loading from "../../components/ui/Loading"
import DatePicker from "../../components/form/date-picker";
import { toLocalDate } from "../../utils/helpers";
interface EmployeFormInput {
    complete_name: string;
    // username: string;
    // password: string;
    // role: 'staff' | 'controller' | 'pusat';
    // access_apps: 'access' | 'noAccess';
    jenis_ijazah: string,
    tanggal_masuk: string,
    tanggal_keluar: string,
    position: string;
    status: 'aktif' | 'nonAktif';
}


const schema: yup.SchemaOf<EmployeFormInput> = yup.object({
    complete_name: yup.string().required('Nama Lengkap wajib diisi'),
    tanggal_masuk: yup.string().required('Tanggal Masuk wajib diisi'),
    jenis_ijazah: yup.string().required('Jenis Ijazah wajib diisi'),
    position: yup.string().required('Posisi wajib diisi'),
    status: yup.mixed<'aktif' | 'nonAktif'>()
        .oneOf(['aktif', 'nonAktif'], 'Status tidak valid')
        .required('Status wajib dipilih'),
});

const EmployeForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const isUpdate = !!id;
    const {
        register,
        handleSubmit,
        setError,
        reset,
        getValues, setValue,
        formState: { errors }
    } = useForm<EmployeFormInput>({
        resolver: yupResolver(schema)
    });
    const navigate = useNavigate();
    useEffect(() => {
        if (id) {
            setLoading(true)
            axios.get("/api/employees/" + id).then((res: any) => {
                const { user } = res.data;

                reset({ ...user, tanggal_masuk: toLocalDate(new Date(user.tanggal_masuk)), tanggal_keluar: user.tanggal_keluar ? toLocalDate(new Date(user.tanggal_keluar)) : null })
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }
    }, []);
    const onSubmit = async (data: EmployeFormInput) => {
        try {
            let res;
            if (!id) {
                res = await axios.post("/api/employees", data);
            } else {
                res = await axios.put("/api/employees/" + id, data)
            }


            if (res.status == 200) {
                if (!id)
                    toast.success("Pengguna berhasil ditambah")
                else
                    toast.success("Pengguna berhasil diubah")
                navigate("/employe")
            }
        } catch (error: any) {
            console.log(error);

            if (error.status == 400) {
                if (error.response.data.errors) {
                    // Jika ada error dalam error.responseponse, setError pada masing-masing field
                    Object.keys(error.response.data.errors).forEach((key: any) => {
                        setError(key, {
                            type: 'manual',
                            message: error.response.data.errors[key], // Pesan error dari response
                        });
                    });
                }
            } else {
                setAlert("Terjadi kesalahan dengan server");
            }
        }

    }
    if (loading && isUpdate) return <Loading />
    return (
        <>
            <PageMeta
                title={`${!id ? "Tambah Karyawan" : "Ubah Karyawan"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Karyawan" : "Ubah Karyawan"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/employe"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke karyawan
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}

                <ComponentCard title={!id ? "Tambah Pengguna" : "Ubah Pengguna"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <div>
                                <Label>
                                    Nama Lengkap <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan nama lengkap"
                                    {...register("complete_name")}
                                />
                                {errors.complete_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.complete_name.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="jenis_ijazah">Jenis Ijazah <span className="text-error-500">*</span></Label>
                                <Select
                                    {...register("jenis_ijazah")}
                                    options={[
                                        { label: "SD", value: "SD" },
                                        { label: "SMP", value: "SMP" },
                                        { label: "SMA", value: "SMA" },
                                        { label: "S1", value: "S1" },
                                        { label: "D1", value: "D1" },
                                        { label: "D2", value: "D2" },
                                        { label: "D3", value: "D3" },
                                        { label: "D4", value: "D4" },
                                    ]}
                                    placeholder="Pilih jenis ijazah"
                                />
                                {errors.jenis_ijazah && <p className="text-sm text-red-500 mt-1">{errors.jenis_ijazah.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="tanggal_masuk">Tanggal Masuk <span className="text-error-500">*</span></Label>
                                <DatePicker
                                    id={"tanggal_masuk"}
                                    mode="single"
                                    placeholder="Tanggal masuk"
                                    defaultDate={getValues("tanggal_masuk")}
                                    onChange={(date) => {
                                        setValue("tanggal_masuk", toLocalDate(date[0]));
                                    }}
                                />
                                {errors.tanggal_masuk && <p className="text-sm text-red-500 mt-1">{errors.tanggal_masuk.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="tanggal_keluar">Tanggal Keluar</Label>
                                <DatePicker
                                    id={"tanggal_keluar"}
                                    mode="single"
                                    placeholder="Tanggal keluar"
                                    defaultDate={getValues("tanggal_keluar")}
                                    onChange={(date) => {
                                        setValue("tanggal_keluar", toLocalDate(date[0]));
                                    }}
                                />
                                {errors.tanggal_keluar && <p className="text-sm text-red-500 mt-1">{errors.tanggal_keluar.message}</p>}
                            </div>


                            <div>
                                <Label>
                                    Jabatan <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan jabatan"
                                    {...register("position")}
                                />
                                {errors.position && (
                                    <p className="mt-1 text-sm text-red-500">{errors.position.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Status <span className="text-error-500">*</span>
                                </Label>
                                <Select options={[{ label: 'Aktif', value: "aktif" }, { label: 'Non Aktif', value: "nonAktif" }]} placeholder="Pilih status" {...register("status")} />

                                {errors.status && (
                                    <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <Button size="sm">Simpan</Button>
                        </div>
                    </Form>

                </ComponentCard>
            </div>
        </>
    );
}

export default EmployeForm;
