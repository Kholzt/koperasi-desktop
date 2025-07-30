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
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon } from "../../icons";
import axios from "../../utils/axios";
import { AreaProps, GroupProps } from "../../utils/types";

interface ScheduleFormInput {
    area_id: number;
    group_id: number;
    pos_id: string;
    day: "senin" | "selasa" | "rabu" | "kamis" | "jum'at" | "sabtu" | "minggu",
    status: 'aktif' | 'nonAktif';
}


const schema: yup.SchemaOf<ScheduleFormInput> = yup.object({
    pos_id: yup.string().required('Pos  wajib dipilih'),
    area_id: yup.string().required('Wilayah  wajib diisi'),
    group_id: yup.string().required('Kelompok  wajib diisi'),
    day: yup.string().required('Hari  wajib diisi'),
    status: yup.mixed<'aktif' | 'nonAktif'>()
        .oneOf(['aktif', 'nonAktif'], 'Status tidak valid')
        .required('Status wajib dipilih'),
});

const ScheduleForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [areas, setAreas] = useState<{ label: string, value: string }[]>([]);
    const [groups, setGroups] = useState<{ label: string, value: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [pos, setPos] = useState<{ label: string, value: string }[]>([]);

    const { id } = useParams();
    const isUpdate = !!id;
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors }
    } = useForm<ScheduleFormInput>({
        resolver: yupResolver(schema)
    });
    const navigate = useNavigate();
    useEffect(() => {
        if (id) {
            setLoading(true);

            axios.get("/api/schedule/" + id).then(res => {
                reset(res.data.schedule)
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });

        }

        axios.get("/api/areas?limit=20000000").then(res => {
            setAreas(res.data.areas.map((area: AreaProps) => ({ label: area.area_name, value: area.id })))
        });
        axios.get("/api/groups?limit=20000000").then(res => {
            setGroups(res.data.groups.map((group: GroupProps) => ({ label: group.group_name, value: group.id })))
        });

        axios.get("/api/pos?limit=200000000").then(res => {
            setPos(res.data.pos.map((p: any) => ({ label: p.nama_pos, value: p.id })))
        });
    }, []);

    const onSubmit = async (data: ScheduleFormInput) => {
        try {
            let res;
            if (!id) {
                res = await axios.post("/api/schedule", data);
            } else {
                res = await axios.put("/api/schedule/" + id, data)
            }


            if (res.status == 200) {
                if (!id)
                    toast.success("Schedule berhasil ditambah")
                else
                    toast.success("Schedule berhasil diubah")
                navigate("/schedule")
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
            } else if (error.status == 409) {
                if (error.response.data.error) {
                    setAlert(error.response.data.error);
                    Object.keys(error.response.data.errors).forEach((key: any) => {
                    });
                }
            } else {
                setAlert("Terjadi kesalahan dengan server");

            }
        }

    }

    const days = [
        { label: "Senin", value: "senin" },
        { label: "Selasa", value: "selasa" },
        { label: "Rabu", value: "rabu" },
        { label: "Kamis", value: "kamis" },
        { label: "Jumat", value: "jumat" },
        { label: "Sabtu", value: "sabtu" },
        { label: "Minggu", value: "minggu" }
    ];


    if (loading && isUpdate) return <Loading />;

    return (
        <>
            <PageMeta
                title={`${!id ? "Tambah Jadwal" : "Ubah Jadwal"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Jadwal" : "Ubah Jadwal"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/schedule"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke jadwal
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}

                <ComponentCard title={!id ? "Tambah Jadwal" : "Ubah Jadwal"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <Label>
                                Wilayah <span className="text-error-500">*</span>
                            </Label>
                            <Select options={areas} placeholder="Pilih wilayah" {...register("area_id")} />
                            {errors.area_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.area_id.message}</p>
                            )}
                        </div>
                        <div>
                            <Label>
                                Kelompok <span className="text-error-500">*</span>
                            </Label>
                            <Select options={groups} placeholder="Pilih kelompok" {...register("group_id")} />
                            {errors.group_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.group_id.message}</p>
                            )}
                        </div>
                        <div>
                            <Label>
                                Hari <span className="text-error-500">*</span>
                            </Label>
                            <Select options={days} placeholder="Pilih hari" {...register("day")} />
                            {errors.day && (
                                <p className="mt-1 text-sm text-red-500">{errors.day.message}</p>
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
                            <Label>
                                Status <span className="text-error-500">*</span>
                            </Label>
                            <Select options={[{ label: 'Aktif', value: "aktif" }, { label: 'Non Aktif', value: "nonAktif" }]} placeholder="Pilih status" {...register("status")} />

                            {errors.status && (
                                <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
                            )}
                        </div>
                        <div>
                            <Button size="sm">Simpan</Button>
                        </div>
                    </Form>

                </ComponentCard>
            </div >
        </>
    );
}

export default ScheduleForm;
