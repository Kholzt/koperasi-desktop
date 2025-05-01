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

interface MemberFormInput {
    complete_name: string;
    area_id: number;
    address: string
}


const schema: yup.SchemaOf<MemberFormInput> = yup.object({
    complete_name: yup.string()
        .required('Nama kelompok  wajib diisi'),
    area_id: yup.string()
        .required('Area wajib diisi'),
    address: yup.string().required('Alamat  wajib diisi'),

});

const MemberForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const [areas, setAreas] = useState<{ label: string, value: string }[]>([]);

    const { id } = useParams();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        setError,
        reset,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<MemberFormInput>({
        resolver: yupResolver(schema),
        defaultValues: {
            complete_name: "",
            area_id: undefined,
            address: ""
        }
    });

    useEffect(() => {
        if (id) {
            axios.get("/api/members/" + id).then(res => {
                const data = res.data.member
                console.log(data);

                reset(data)
            });
        }
        axios.get("/api/areas").then(res => {
            setAreas(res.data.areas.map((area: AreaProps) => ({ label: area.area_name, value: area.id })))
        });
    }, []);


    const onSubmit = async (data: MemberFormInput) => {
        console.log(data);
        try {
            let res;
            if (!id) {
                res = await axios.post("/api/members", data);
            } else {
                res = await axios.put("/api/members/" + id, data)
            }

            if (res.status == 201) {
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
                                Nama  <span className="text-error-500">*</span>
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
                            <Label>
                                Wilayah <span className="text-error-500">*</span>
                            </Label>
                            <Select options={areas} placeholder="Pilih area" {...register("area_id")} />
                            {errors.area_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.area_id.message}</p>
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
                            <Button size="sm">Simpan</Button>
                        </div>
                    </Form>

                </ComponentCard>
            </div>
        </>
    );
}

export default MemberForm;
