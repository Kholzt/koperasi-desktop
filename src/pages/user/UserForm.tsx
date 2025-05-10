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

interface UserFormInput {
    complete_name: string;
    username: string;
    password: string;
    role: 'staff' | 'controller' | 'pusat';
    // access_apps: 'access' | 'noAccess';
    // position: string;
    status: 'aktif' | 'nonAktif';
}


const schema: yup.SchemaOf<UserFormInput> = yup.object({
    complete_name: yup.string().required('Nama Lengkap wajib diisi'),
    username: yup.string().required('Username wajib diisi'),
    password: yup.string()
        .min(6, 'Password minimal 6 karakter')
        .nullable(),
    role: yup.mixed<'staff' | 'controller' | 'pusat'>()
        .oneOf(['staff', 'controller', 'pusat'], 'Role tidak valid')
        .required('Role wajib dipilih'),
    // access_apps: yup.mixed<'access' | 'noAccess'>()
    //     .oneOf(['access', 'noAccess'], 'Access Apps tidak valid')
    //     .required('Akses aplikasi wajib dipilih'),
    // position: yup.string().required('Posisi wajib diisi'),
    status: yup.mixed<'aktif' | 'nonAktif'>()
        .oneOf(['aktif', 'nonAktif'], 'Status tidak valid')
        .required('Status wajib dipilih'),
});

const UserForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    const isUpdate = !!id;
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors }
    } = useForm<UserFormInput>({
        resolver: yupResolver(schema)
    });
    const navigate = useNavigate();
    useEffect(() => {
        if (id) {
            setLoading(true);

            axios.get("/api/users/" + id).then(res => {
                console.log(res);
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }
    }, []);
    const onSubmit = async (data: UserFormInput) => {
        try {
            let res;
            if (!id) {
                res = await axios.post("/api/users", data);
            } else {
                res = await axios.put("/api/users/" + id, data)
            }


            if (res.status == 201) {
                if (!id)
                    toast.success("Pengguna berhasil ditambah")
                else
                    toast.success("Pengguna berhasil diubah")
                navigate("/user")
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

    if (loading) return <Loading />;

    return (
        <>
            <PageMeta
                title={`${!id ? "Tambah Pengguna" : "Ubah Pengguna"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Pengguna" : "Ubah Pengguna"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/user"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke pengguna
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}

                <ComponentCard title={!id ? "Tambah Pengguna" : "Ubah Pengguna"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <div>
                                <Label>
                                    Username <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan username"
                                    {...register("username")}
                                />
                                {errors.username && (
                                    <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                                )}
                            </div>
                            {!isUpdate && <div>
                                <Label>
                                    Password <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan password"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                                )}
                            </div>}
                            <div>
                                <Label>
                                    Role <span className="text-error-500">*</span>
                                </Label>
                                <Select options={[{ label: 'Staff', value: "staff" }, { label: 'Controller', value: "controller" }, { label: 'Pusat', value: "pusat" }]} placeholder="Pilih role" {...register("role")} />

                                {errors.role && (
                                    <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
                                )}
                            </div>
                            {/* <div>
                                <Label>
                                    Access Apps <span className="text-error-500">*</span>
                                </Label>
                                <Select options={[{ label: 'Access', value: "access" }, { label: 'NoAccess', value: "noAccess" }]} placeholder="Pilih access apps" {...register("access_apps")} />

                                {errors.access_apps && (
                                    <p className="mt-1 text-sm text-red-500">{errors.access_apps.message}</p>
                                )}
                            </div> */}
                            {/* <div>
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
                            </div> */}
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

export default UserForm;
