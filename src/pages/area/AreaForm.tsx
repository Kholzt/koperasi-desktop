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

interface AreaFormInput {
    area_name: string;
    city: string;
    subdistrict: string;
    village: string;
    address: string;
    status: 'aktif' | 'nonAktif';
}


const schema: yup.SchemaOf<AreaFormInput> = yup.object({
    area_name: yup.string().required('Nama wilayah  wajib diisi'),
    city: yup.string().required('Kota   wajib diisi'),
    subdistrict: yup.string().required('Kecamatan  wajib diisi'),
    village: yup.string().required('Desa  wajib diisi'),
    address: yup.string().required('Alamat  wajib diisi'),
    status: yup.mixed<'aktif' | 'nonAktif'>()
        .oneOf(['aktif', 'nonAktif'], 'Status tidak valid')
        .required('Status wajib dipilih'),
});

const AreaForm: React.FC = () => {
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
    } = useForm<AreaFormInput>({
        resolver: yupResolver(schema)
    });
    const navigate = useNavigate();
    useEffect(() => {
        if (id) {
            setLoading(true)
            axios.get("/api/areas/" + id).then(res => {
                reset(res.data.area)
                setTimeout(() => {
                    setLoading(false)
                }, 500);
            });
        }
    }, []);
    const onSubmit = async (data: AreaFormInput) => {
        try {
            let res;
            if (!id) {
                res = await axios.post("/api/areas", data);
            } else {
                res = await axios.put("/api/areas/" + id, data)
            }


            if (res.status == 201) {
                if (!id)
                    toast.success("Area berhasil ditambah")
                else
                    toast.success("Area berhasil diubah")
                navigate("/area")
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


    if (loading) return <Loading />

    return (
        <>
            <PageMeta
                title={`${!id ? "Tambah Wilayah" : "Ubah Wilayah"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Wilayah" : "Ubah Wilayah"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/area"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Wilayah
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}

                <ComponentCard title={!id ? "Tambah Wilayah" : "Ubah Wilayah"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label>
                                Nama wilayah <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                placeholder="Masukkan nama wilayah"
                                {...register("area_name")}
                            />
                            {errors.area_name && (
                                <p className="mt-1 text-sm text-red-500">{errors.area_name.message}</p>
                            )}
                        </div>
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <div>
                                <Label>
                                    Kota <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan kota"
                                    {...register("city")}
                                />
                                {errors.city && (
                                    <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Kecamatan <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan kecamatan"
                                    {...register("subdistrict")}
                                />
                                {errors.subdistrict && (
                                    <p className="mt-1 text-sm text-red-500">{errors.subdistrict.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Desa <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan desa"
                                    {...register("village")}
                                />
                                {errors.village && (
                                    <p className="mt-1 text-sm text-red-500">{errors.village.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Alamat <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan alamat"
                                    {...register("address")}
                                />
                                {errors.address && (
                                    <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
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

export default AreaForm;
