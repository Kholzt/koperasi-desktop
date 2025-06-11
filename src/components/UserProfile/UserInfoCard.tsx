
import Form from "../../components/form/Form";
import { toast } from "react-toastify";
import { useModal } from "../../hooks/useModal";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import * as yup from 'yup';
import { useUser } from "../../hooks/useUser";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Loading from "../ui/Loading";
import { useEffect } from "react";
import axios from "../../utils/axios";
import { useNavigate } from "react-router";


interface UserFormInput {
    complete_name: string;
    username: string;
    password: string;
}


const schema: yup.SchemaOf<UserFormInput> = yup.object({
    complete_name: yup.string().required('Nama Lengkap wajib diisi'),
    username: yup.string().required('Username wajib diisi'),
    hasPassword: yup.boolean(),
    // password: yup
    //     .string()
    //     .nullable() // Memungkinkan nilai null atau undefined
    //     .when("hasPassword", (hasPassword, schema) => {
    //         if (hasPassword)
    //             schema.min(6, 'Password minimal 6 karakter') // Maka jalankan validasi min(6)
    //         return schema.required("Must enter email address")
    //         return schema
    //     })
});
export default function UserInfoCard() {
    const { closeModal } = useModal();
    const navigate = useNavigate();
    const handleSave = () => {
        console.log("Saving changes...");
        closeModal();
    };

    const { user } = useUser()
    const id = user?.id;
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors }
    } = useForm<UserFormInput>({
        resolver: yupResolver(schema),
    });



    const onSubmit = async (data: UserFormInput) => {
        try {
            if (data.password.length > 0 && data.password.length < 6) {
                return setError("password", {
                    type: 'manual',
                    message: "Password minimal 6 karakter", // Pesan error dari response
                });
            }
            let res;
            res = await axios.put("/api/profile-update/" + id, data);
            if (res.status == 200) {
                toast.success("Profil berhasil diubah")
                window.location.reload()
            }
        } catch (error: any) {
            if (error.status == 400) {
                if (error.response.data.errors) {
                    Object.keys(error.response.data.errors).forEach((key: any) => {
                        setError(key, {
                            type: 'manual',
                            message: error.response.data.errors[key], // Pesan error dari response
                        });
                    });
                }
            } else {
                // setAlert("Terjadi kesalahan dengan server");
            }
        }
    }


    if (!user) return <Loading />
    return (
        <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
            <div className="flex flex-col w-full gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="w-full">
                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                        Personal Information
                    </h4>

                    <div className="">
                        <Form onSubmit={handleSubmit(onSubmit)} className="">
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7">
                                <div>
                                    <Label>
                                        Nama Lengkap <span className="text-error-500">*</span>
                                    </Label>
                                    <Input
                                        defaultValue={user.complete_name}
                                        placeholder="Masukkan nama lengkap"
                                        {...register("complete_name")}
                                    />
                                    {errors.complete_name && (
                                        <p className="mt-1 text-sm text-red-500">{errors.complete_name.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>
                                        Username <span className="text-error-500">*</span>
                                    </Label>
                                    <Input
                                        defaultValue={user.username}
                                        placeholder="Masukkan username"
                                        {...register("username")}
                                    />
                                    {errors.username && (
                                        <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>
                                        Password
                                    </Label>
                                    <Input
                                        hint="Masukkan Password jika ingin melakukan perubahan"
                                        placeholder="Masukkan password"
                                        {...register("password")}
                                    />
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button size="sm">Simpan</Button>
                            </div>
                        </Form>
                    </div>
                </div>

            </div>

        </div>
    );
}
