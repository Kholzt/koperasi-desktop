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
    pos_id: string;
    nik: string;
    no_kk: string;
    complete_name: string;
    area_id: number;
    address: string,
    description: string,
}


const schema: yup.SchemaOf<MemberFormInput> = yup.object({
    nik: yup.string()
        .required('NIK  wajib diisi'),
    no_kk: yup.string()
        .required('NO KK  wajib diisi'),
    complete_name: yup.string()
        .required('Nama kelompok  wajib diisi'),
    pos_id: yup.string()
        .required('Pos  wajib dipilih'),
    area_id: yup.string()
        .required('Area wajib diisi'),
    address: yup.string().required('Alamat  wajib diisi'),

});

const MemberForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [areas, setAreas] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [nikExist, setNikExist] = useState(false);
    const [noKKExist, setNoKKExist] = useState(false);
    const [hasPinjaman, setHasPinjaman] = useState(false);
    const [pos, setPos] = useState<{ label: string, value: string }[]>([]);

    const { id } = useParams();
    const isUpdate = !!id;
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<MemberFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            complete_name: "",
            area_id: undefined,
            address: "",
            nik: "0",
            no_kk: "0"
        }
    });

    useEffect(() => {
        if (id) {
            setLoading(true);

            axios.get("/api/members/" + id).then(res => {
                const data = res.data.member
                setHasPinjaman(data.hasPinjaman)
                console.log(res.data, "halo");
                reset(data)
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }
        axios.get("/api/areas?limit=20000000").then(res => {
            setAreas(res.data.areas.map((area: AreaProps) => ({ label: area.area_name, value: area.id })))
        });

        axios.get("/api/pos?limit=200000000").then(res => {
            setPos(res.data.pos.map((p: any) => ({ label: p.nama_pos, value: p.id })))
        });
    }, []);

    const nik = watch("nik");
    const no_kk = watch("no_kk");
    useEffect(() => {
        if (nik) {
            axios.get(`/api/members/${nik}/nik-check?ignoreId=${id}`).then((data) => {
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
        if (no_kk) {
            axios.get(`/api/members/${no_kk}/nokk-check?ignoreId=${id}`).then((data) => {
                setNoKKExist(data.data.no_kkExist)
                if (data.data.no_kkExist) {
                    setError("no_kk", {
                        type: 'manual',
                        message: "No KK sudah ada", // Pesan error dari response
                    });
                } else {
                    setError("no_kk", {
                        type: 'manual',
                        message: "", // Pesan error dari response
                    });

                }
            })
        }
        setValue('nik', nik.slice(0, 16))
        setValue('no_kk', no_kk.slice(0, 16))
    }, [nik, no_kk]);

    const onSubmit = async (data: MemberFormInput) => {
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
                                readOnly={hasPinjaman}
                                min={0}
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
                                readOnly={hasPinjaman}
                                min={0}
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
                            <Label>
                                Keterangan
                                {/* <span className="text-error-500">*</span> */}
                            </Label>
                            <Input
                                disabled={nikExist}

                                placeholder="Masukkan Keterangan"
                                {...register("description")}
                            />
                            {errors.description && (
                                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                            )}
                        </div>
                        <div>
                            <Label>
                                Pos <span className="text-error-500">*</span>
                            </Label>
                            <Select options={pos} placeholder="Pilih pos" {...register("pos_id")} />

                            {errors.pos_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.pos_id.message}</p>
                            )}
                        </div>
                        <div>
                            <Button
                                disabled={nikExist || noKKExist}
                                size="sm">Simpan</Button>
                        </div>
                    </Form>

                </ComponentCard>
            </div>
        </>
    );
}

export default MemberForm;
