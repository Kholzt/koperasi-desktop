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
import Select from "../../components/form/Select";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon } from "../../icons";
import axios from "../../utils/axios";
import { AreaProps, UserProps } from "../../utils/types";
import Loading from "../../components/ui/Loading"
interface GroupFormInput {
    group_name: string;
    pos_id: string;
    staffs: string[]
}


const schema: yup.SchemaOf<GroupFormInput> = yup.object({
    pos_id: yup.string().required('Pos  wajib dipilih'),
    group_name: yup.string()
        .required('Nama kelompok  wajib dipilih'),
    staffs: yup.array().of(yup.string().trim()
        .min(1, 'Silahkan pilih karyawan')
        .required('Silahkan pilih karyawan'))
        .min(1, "Minimal pilih satu karyawan")
        .required('Karyawan wajib dipilih'),
});

const GroupForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [areas, setAreas] = useState<{ label: string, value: string }[]>([]);
    const [staffs, setStaffs] = useState<{ text: string, value: string }[]>([]);
    const [pos, setPos] = useState<{ label: string, value: string }[]>([]);

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
        getValues,
        formState: { errors }
    } = useForm<GroupFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            group_name: "",
            staffs: []
        }
    });

    useEffect(() => {
        if (id) {
            setLoading(true);
            axios.get("/api/groups/" + id).then(res => {
                const data = res.data.group
                data.staffs = data.staffs.map((d: any) => {
                    return d.id.toString()
                });
                reset(data)
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }
        axios.get("/api/areas?limit=20000000").then(res => {
            setAreas(res.data.areas.map((area: AreaProps) => ({ label: area.area_name, value: area.id })))
        });
        axios.get("/api/employees?limit=20000000").then(res => {
            setStaffs(res.data.employees.map((employe: UserProps) => ({ text: employe.complete_name, value: employe.id })))
        });
        axios.get("/api/pos?limit=200000000").then(res => {
            setPos(res.data.pos.map((p: any) => ({ label: p.nama_pos, value: p.id })))
        });
    }, []);


    const onSubmit = async (data: GroupFormInput) => {
        try {
            let res;
            if (!id) {
                res = await axios.post("/api/groups", data);
            } else {
                res = await axios.put("/api/groups/" + id, data)
            }
            if (res.status == 200) {
                if (!id)
                    toast.success("Kelompok berhasil ditambah")
                else
                    toast.success("Kelompok berhasil diubah")
                navigate("/group")
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
                title={`${!id ? "Tambah Kelompok" : "Ubah Kelompok"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""

            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Kelompok" : "Ubah Kelompok"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/group"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Kelompok
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}
                <ComponentCard title={!id ? "Tambah Kelompok" : "Ubah Kelompok"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <div>
                                <Label>
                                    Nama kelompok <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan nama lengkap"
                                    {...register("group_name")}
                                />
                                {errors.group_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.group_name.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Karyawan <span className="text-error-500">*</span>
                                </Label>
                                <MultiSelect
                                    label=""
                                    placeholder="Pilih karyawan"
                                    options={staffs}
                                    defaultSelected={getValues("staffs")}
                                    {...register("staffs")}
                                    onChange={(val) => setValue("staffs", val)}
                                />


                                {errors.staffs && typeof errors.staffs?.message === 'string' && (
                                    <p className="mt-1 text-sm text-red-500">{errors.staffs?.message}</p>
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

export default GroupForm;
