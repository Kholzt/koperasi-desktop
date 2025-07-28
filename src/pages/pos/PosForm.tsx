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
import MultiSelect from "../../components/form/MultiSelect";
import Input from "../../components/form/input/InputField";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon } from "../../icons";
import axios from "../../utils/axios";
import { AreaProps, UserProps } from "../../utils/types";
import Select from "../../components/form/Select";
interface PosFormInput {
    nama_pos: string;
    penanggung_jawab: number,
    alamat: string,
    no_telepon: string
}


const schema: yup.SchemaOf<PosFormInput> = yup.object({
    nama_pos: yup.string()
        .required('Nama pos wajib diisi'),
    alamat: yup.string()
        .required('Alamat wajib diisi'),
    no_telepon: yup.string()
        .required('No telepon wajib diisi').min(12, "No telepon minimal 12 karakter"),
    penanggung_jawab: yup.string()
        .required('Penanggung jawab wajib diisi'),
});

const PosForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [areas, setAreas] = useState<{ label: string, value: string }[]>([]);
    const [staffs, setStaffs] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(true);

    const { id } = useParams();
    const isUpdate = !!id;
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        setValue,
        getValues, watch,
        formState: { errors }
    } = useForm<PosFormInput>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (id) {
            setLoading(true);
            axios.get("/api/pos/" + id).then(res => {
                const data = res.data.pos
                reset(data)
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }
        axios.get("/api/users?limit=20000000").then(res => {
            setStaffs(res.data.users.map((employe: UserProps) => ({ label: employe.complete_name, value: employe.id })))
        });
    }, []);

    const noHp = watch("no_telepon");
    useEffect(() => {
        if (noHp) {
            if (parseInt(noHp) < 0) {
                setValue('no_telepon', "0")
            }
            setValue('no_telepon', noHp.slice(0, 13))
        }

    }, [noHp]);

    const onSubmit = async (data: PosFormInput) => {

        try {
            let res;
            if (!id) {
                res = await axios.post("/api/pos", data);
            } else {
                res = await axios.put("/api/pos/" + id, data)
            }
            if (res.status == 200) {
                if (!id)
                    toast.success("Pos berhasil ditambah")
                else
                    toast.success("Pos berhasil diubah")
                navigate("/pos")
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
                title={`${!id ? "Tambah Pos" : "Ubah Pos"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""

            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Pos" : "Ubah Pos"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/pos"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Pos
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}
                <ComponentCard title={!id ? "Tambah Pos" : "Ubah Pos"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <div>
                                <Label>
                                    Nama Pos <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan nama Pos"
                                    {...register("nama_pos")}
                                />
                                {errors.nama_pos && (
                                    <p className="mt-1 text-sm text-red-500">{errors.nama_pos.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Alamat <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan alamat"
                                    {...register("alamat")}
                                />
                                {errors.alamat && (
                                    <p className="mt-1 text-sm text-red-500">{errors.alamat.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    No Telepon <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    min={0}
                                    type="number"
                                    placeholder="Masukkan no telepon"
                                    {...register("no_telepon")}
                                />
                                {errors.no_telepon && (
                                    <p className="mt-1 text-sm text-red-500">{errors.no_telepon.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Penanggung jawab <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan Penganggung Jawab"
                                    {...register("penanggung_jawab")}
                                />


                                {errors.penanggung_jawab && (
                                    <p className="mt-1 text-sm text-red-500">{errors.penanggung_jawab.message}</p>
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

export default PosForm;
