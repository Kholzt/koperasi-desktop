import React, { useEffect, useState } from "react";

import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
import axios from "../../utils/axios";
import Button from "../../components/ui/button/Button";
import { Link, useNavigate, useParams } from "react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Form from "../../components/form/Form";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Alert from "../../components/ui/alert/Alert";
import { ChevronLeftIcon, PlusIcon, TrashBinIcon } from "../../icons";
import { toast } from 'react-toastify';
import { AreaProps, EmployeProps, UserProps } from "../../utils/types";
import MultiSelect from "../../components/form/MultiSelect";

interface GroupFormInput {
    group_name: string;
    area_id: number;
    staff: String[]
}


const schema: yup.SchemaOf<GroupFormInput> = yup.object({
    group_name: yup.string()
        .required('Nama kelompok  wajib diisi'),
    area_id: yup.string()
        .required('Area wajib diisi'),
    staff: yup.array().of(yup.string().trim()
        .min(1, 'Silahkan pilih staff')
        .required('Silahkan pilih staff'))
        .min(1, "Minimal pilih satu staff")
        .required('Staff wajib diisi'),
});

const GroupForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [areas, setAreas] = useState<{ label: string, value: string }[]>([]);
    const [staff, setStaff] = useState<{ text: string, value: string }[]>([]);

    const { id } = useParams();
    const navigate = useNavigate();

    const { control,
        register,
        handleSubmit,
        setError,
        reset,
        getValues,
        setValue,
        formState: { errors }
    } = useForm<GroupFormInput>({
        resolver: yupResolver(schema)
    });
    const { fields, append, remove } = useFieldArray({
        control,
        name: "staff",
    });
    useEffect(() => {
        reset({ group_name: "Hallo", area_id: 2, staff: ["44"] })
        if (id) {
            axios.get("/api/groups/" + id).then(res => {
                reset(res.data.group)
            });
        }
        axios.get("/api/areas").then(res => {
            setAreas(res.data.areas.map((area: AreaProps) => ({ label: area.area_name, value: area.id })))
        });
        axios.get("/api/employees").then(res => {
            setStaff(res.data.employees.map((employe: UserProps) => ({ text: employe.complete_name, value: employe.id })))
        });
    }, []);

    const handleSelect = (e: any) => {

    }
    const onSubmit = async (data: GroupFormInput) => {
        console.log(data);

        try {
            let res;
            // if (!id) {
            //     res = await axios.post("/api/groups", data);
            // } else {
            //     res = await axios.put("/api/groups/" + id, data)
            // }


            // if (res.status == 201) {
            //     if (!id)
            //         toast.success("Kelompok berhasil ditambah")
            //     else
            //         toast.success("Kelompok berhasil diubah")
            //     navigate("/group")
            // }
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

    return (
        <>
            <PageMeta
                title={`${!id ? "Tambah Kelompok" : "Ubah Kelompok"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""

            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Kelompok" : "Ubah Kelompok"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/area"
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
                                    Area <span className="text-error-500">*</span>
                                </Label>
                                <Select options={areas} placeholder="Pilih area" {...register("area_id")} />
                                {errors.area_id && (
                                    <p className="mt-1 text-sm text-red-500">{errors.area_id.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Label>
                                Staff <span className="text-error-500">*</span>
                            </Label>
                            <MultiSelect
                                label=""
                                options={staff}
                                // defaultSelected={["1", "3"]}
                                {...register("staff")}
                                onChange={(val) => setValue("staff", val)}
                            />

                            {errors.staff && typeof errors.staff?.message === 'string' && (
                                <p className="mt-1 text-sm text-red-500">{errors.staff?.message}</p>
                            )}


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
