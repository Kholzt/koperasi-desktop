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
import { AreaProps } from "../../utils/types";
import Loading from "../../components/ui/Loading"

interface MemberFormInput {
    nik: number;
    no_kk: number;
    complete_name: string;
    area_id: number;
    address: string
}


const schema: yup.SchemaOf<MemberFormInput> = yup.object({
    nik: yup.number()
        // .min(16, "NIK minimal 16")
        // .max(16, "NIK maksimal 16")
        .required('NIK  wajib diisi'),
    no_kk: yup.number()
        // .min(16, "No KK minimal 16")
        // .max(16, "No KK maksimal 16")
        .required('NO KK  wajib diisi'),
    complete_name: yup.string()
        .required('Nama kelompok  wajib diisi'),
    area_id: yup.string()
        .required('Area wajib diisi'),
    address: yup.string().required('Alamat  wajib diisi'),

});

const MemberForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [areas, setAreas] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [nikExist, setNikExist] = useState(false);
    const { id } = useParams();
    const isUpdate = !!id;
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        setValue,
        getValues,
        watch,
        formState: { errors }
    } = useForm<MemberFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            complete_name: "",
            area_id: undefined,
            address: "",
            nik: 0,
            no_kk: 0
        }
    });

    useEffect(() => {
        if (id) {
            setLoading(true);

            axios.get("/api/members/" + id).then(res => {
                const data = res.data.member
                console.log(data);

                reset(data)
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }
        axios.get("/api/areas?limit=2000").then(res => {
            setAreas(res.data.areas.map((area: AreaProps) => ({ label: area.area_name, value: area.id })))
        });
    }, []);

    const nik = watch("nik");
    useEffect(() => {
        if (nik) {
            axios.get(`/api/members/${nik}/check`).then((data) => {
                setNikExist(data.data.nikExist);
                if (data.data.nikExist) {
                    setError("nik", {
                        type: 'manual',
                        message: "Nik sudah ada", // Pesan error dari response
                    });
                } else {
                    setError("nik", {
                        type: 'manual',
                        message: "", // Pesan error dari response
                    });

                }
            })
        }
    }, [nik]);

    const onSubmit = async (data: MemberFormInput) => {
        console.log(data);
        try {
            let res;
            if (!id) {
                res = await axios.post("/api/members", data);
            } else {
                res = await axios.put("/api/members/" + id, data)
            }

            if (res.status == 200) {
                if (!id)
                    toast.success("Anggota berhasil ditambah")
                else
                    toast.success("Anggota berhasil diubah")
                navigate("/member")
            }
        } catch (error: any) {
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
    if (loading && isUpdate) return <Loading />;

    return (
        <>
            <PageMeta
                title={`${!id ? "Tambah Anggota" : "Ubah Anggota"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""

            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Anggota" : "Ubah Anggota"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/member"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Anggota
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}
                <ComponentCard title={!id ? "Tambah Anggota" : "Ubah Anggota"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label>
                                NIK  <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                placeholder="Masukkan NIK"
                                {...register("nik")}
                            />
                            {errors.nik && (
                                <p className="mt-1 text-sm text-red-500">{errors.nik.message}</p>
                            )}
                        </div>
                        <div>
                            <Label>
                                NO KK  <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                disabled={nikExist}
                                type="number"
                                placeholder="Masukkan No KK"
                                {...register("no_kk")}
                            />
                            {errors.no_kk && (
                                <p className="mt-1 text-sm text-red-500">{errors.no_kk.message}</p>
                            )}
                        </div>
                        <div>
                            <Label>
                                Nama  <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                disabled={nikExist}

                                placeholder="Masukkan nama lengkap"
                                {...register("complete_name")}
                            />
                            {errors.complete_name && (
                                <p className="mt-1 text-sm text-red-500">{errors.complete_name.message}</p>
                            )}
                        </div>
                        <div>
                            <Label>
                                Wilayah <span className="text-error-500">*</span>
                            </Label>
                            <Select
                                disabled={nikExist}
                                options={areas} placeholder="Pilih area" {...register("area_id")} />
                            {errors.area_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.area_id.message}</p>
                            )}
                        </div>
                        <div>
                            <Label>
                                Alamat <span className="text-error-500">*</span>
                            </Label>
                            <Input
                                disabled={nikExist}

                                placeholder="Masukkan alamat"
                                {...register("address")}
                            />
                            {errors.address && (
                                <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
                            )}
                        </div>

                        <div>
                            <Button
                                disabled={nikExist}
                                size="sm">Simpan</Button>
                        </div>
                    </Form>

                </ComponentCard>
            </div>
        </>
    );
}

export default MemberForm;
