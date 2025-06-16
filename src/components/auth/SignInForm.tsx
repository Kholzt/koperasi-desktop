import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import axios from "../../utils/axios";
import { useNavigate, Link } from "react-router";
import Alert from "../ui/alert/Alert";
import { useUser } from "../../hooks/useUser";
import { toast } from "react-toastify";

// 1. Tipe untuk data form
interface SignInFormInputs {
    username: string;
    password: string;
}

// 2. Validasi Yup dengan typing
const schema: yup.SchemaOf<SignInFormInputs> = yup.object({
    username: yup.string().required('Username wajib diisi'),
    password: yup.string().required('Password wajib diisi'),
});

export default function SignInForm() {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    const [hasError, setHasError] = useState(false);
    const { saveUser, user } = useUser()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SignInFormInputs>({
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        if (user) {
            navigate("/dashboard");
        }
    }, [user]);

    const onSubmit = async (data: SignInFormInputs) => {
        try {
            const res = await axios.post("/api/login",
                data
            );

            if (res.status === 200) {
                saveUser(res.data.user);
                navigate("/dashboard");
            } else {
                setHasError(true)
            }
        } catch (error: any) {
            console.log(error);
            if (error.status === 404) {
                setHasError(true);
            } else if (error.response.data.error.sqlState == "28000") {
                toast.error("Terdapat kesalahan pada konfigurasi Database");
            }
        }

    };

    return (
        <div className="flex flex-col flex-1">
            {/* <div className="w-full max-w-md pt-10 mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >

                    <ChevronLeftIcon className="size-5" />
                    Back to dashboard
                </Link>
            </div> */}

            <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
                            Masuk
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Masukkan username dan password untuk masuk!
                        </p>
                    </div>
                    {hasError && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message="Pengguna tidak ditemukan" /></div>}
                    <div >
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-6">
                                <div>
                                    <Label>
                                        Username <span className="text-error-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="Masukkan username"
                                        {...register("username")}
                                    />
                                    {errors.username && (
                                        <p className="mt-1 text-sm text-red-500">{errors.username.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>
                                        Password <span className="text-error-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Masukkan password"
                                            {...register("password")}
                                        />
                                        <span
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                                        >
                                            {showPassword ? (
                                                <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                            ) : (
                                                <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                                            )}
                                        </span>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                                    )}
                                </div>

                                <div>
                                    <Button type="submit" className="w-full" size="sm">
                                        Login
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
