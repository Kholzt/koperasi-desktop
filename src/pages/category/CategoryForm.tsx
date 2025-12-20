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
import Input from "../../components/form/input/InputField";
import Loading from "../../components/ui/Loading";
import Alert from "../../components/ui/alert/Alert";
import Button from "../../components/ui/button/Button";
import { ChevronLeftIcon } from "../../icons";
import axios from "../../utils/axios";
interface CategoryFormInput {
    name: string;

}


const schema: yup.SchemaOf<CategoryFormInput> = yup.object({
    name: yup.string()
        .required('Nama kategori wajib diisi'),
});

const CategoryForm: React.FC = () => {
    const [alert, setAlert] = useState("");
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
    } = useForm<CategoryFormInput>({
        resolver: yupResolver(schema),
    });

    useEffect(() => {
        if (id) {
            setLoading(true);
            axios.get("/api/categories/" + id).then(res => {
                const data = res.data.category
                reset(data)
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        }

    }, []);



    const onSubmit = async (data: CategoryFormInput) => {

        try {
            let res;
            if (!id) {
                res = await axios.post("/api/categories", data);
            } else {
                res = await axios.put("/api/categories/" + id, data)
            }

            if (res.status == 200) {
                if (!id)
                    toast.success("Kategori berhasil ditambah")
                else
                    toast.success("Kategori berhasil diubah")
                navigate("/category")
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
                title={`${!id ? "Tambah Kategori" : "Ubah Kategori"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""

            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Kategori" : "Ubah Kategori"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/category"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Kategori
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}
                <ComponentCard title={!id ? "Tambah Kategori" : "Ubah Kategori"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid  grid-cols-1 gap-6">
                            <div>
                                <Label>
                                    Nama Kategori <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan nama kategori"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
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

export default CategoryForm;
