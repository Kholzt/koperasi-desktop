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
import Loading from "../../components/ui/Loading"
import DatePicker from "../../components/form/date-picker";
import { calculateDuration, toLocalDate } from "../../utils/helpers";
interface EmployeFormInput {
    complete_name: string;
    // username: string;
    // password: string;
    // role: 'staff' | 'controller' | 'pusat';
    // access_apps: 'access' | 'noAccess';
    jenis_ijazah: string,
    nip: string,
    address: string,
    masa_kerja: string,
    tanggal_masuk: string,
    tanggal_keluar: string,
    position: string;
    pos_id: string;
    status: 'aktif' | 'nonAktif';
    status_ijazah: 'belum diambil' | 'sudah diambil';
    foto_profile: string;
}


const schema: yup.SchemaOf<EmployeFormInput> = yup.object({
    nip: yup.string().required('NIP wajib diisi'),
    complete_name: yup.string().required('Nama Lengkap wajib diisi'),
    tanggal_masuk: yup.string().required('Tanggal Masuk wajib diisi'),
    address: yup.string().required('Alamat wajib diisi'),
    pos_id: yup.string().required('Pos wajib dipilih'),
    jenis_ijazah: yup.string().required('Jenis Ijazah wajib diisi'),
    position: yup.string().required('Posisi wajib diisi'),
    status: yup.mixed<'aktif' | 'nonAktif'>()
        .oneOf(['aktif', 'nonAktif'], 'Status tidak valid')
        .required('Status wajib dipilih'),
    status_ijazah: yup.mixed<'belum diambil' | 'sudah diambil'>()
        .oneOf(['belum diambil', 'sudah diambil'], 'Status ijazah tidak valid')
        .required('Status ijazah wajib dipilih'),
    foto_profile: yup.mixed()
        .nullable() // Mengizinkan nilai null jika user tidak menyentuh input
        .notRequired() // Menegaskan bahwa ini tidak wajib
        .test('fileSize', 'Ukuran file terlalu besar', (value) => {
            // Jika tidak ada file (null, undefined, atau array kosong), anggap VALID (true)
            if (!value || (value instanceof FileList && value.length === 0) || value.length === 0) {
                return true;
            }
            // Jika ada file, baru cek ukurannya
            const file = value instanceof FileList ? value[0] : value;
            return file.size <= 2 * 1024 * 1024;
        })
        .test('fileType', 'Tipe file tidak didukung', (value) => {
            if (!value || (value instanceof FileList && value.length === 0) || value.length === 0) {
                return true;
            }
            const file = value instanceof FileList ? value[0] : value;
            return ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
        }),
});

const EmployeForm: React.FC = () => {
    const [alert, setAlert] = useState("");
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [pos, setPos] = useState<{ label: string, value: string }[]>([]);
    const [disabled, setDisabled] = useState(false);
    const [file, setFile] = useState<File | null>(null);;
    const [imageUrl, setImageUrl] = useState('');
    const [preview, setPreview] = useState<string>('');
    const [errorFile, setErrorFile] = useState<string>('');
    const [loadingUpload, setLoadingUpload] = useState(false);
    const isUpdate = !!id;
    const {
        register,
        handleSubmit,
        setError,
        reset,
        watch,
        getValues, setValue,
        formState: { errors }
    } = useForm<EmployeFormInput>({
        resolver: yupResolver(schema)
    });
    const navigate = useNavigate();
    useEffect(() => {
        if (id) {
            setLoading(true)
            axios.get("/api/employees/" + id).then((res: any) => {
                const { user } = res.data;
                reset({ ...user, tanggal_masuk: user.tanggal_masuk ? toLocalDate(new Date(user.tanggal_masuk)) : null, tanggal_keluar: user.tanggal_keluar ? toLocalDate(new Date(user.tanggal_keluar)) : null })
                setTimeout(() => {
                    setLoading(false)
                }, 1000);
            });
        } else {
            axios.get("/api/employees/getNip").then(res => {
                reset({ nip: res.data.nip })
            });
        }
        axios.get("/api/pos?limit=200000000").then(res => {
            setPos(res.data.pos.map((p: any) => ({ label: p.nama_pos, value: p.id })))
        });
    }, []);



    const tanggalKeluar = watch("tanggal_keluar");
    const tanggalMasuk = watch("tanggal_masuk");
    const nip = watch("nip");

    useEffect(() => {
        if (tanggalKeluar && tanggalMasuk) {
            const start = new Date(tanggalMasuk);
            const end = new Date(tanggalKeluar);

            if (end < start) {
                setValue("masa_kerja", "Tanggal keluar tidak valid");
                return;
            }

            const diff = calculateDuration(start, end);
            setValue("masa_kerja", `${diff.years} tahun ${diff.months} bulan ${diff.days} hari`);
        }
        if (nip) {
            axios.get(`/api/employees/checkNip?nip=${nip}&ignoreId=${id ?? null}`).then((res: any) => {
                const { isExist } = res.data;
                if (isExist) {
                    setError("nip", {
                        type: 'manual',
                        message: "Nip sudah ada", // Pesan error dari response
                    });
                } else {
                    setError("nip", {
                        type: 'manual',
                        message: "", // Pesan error dari response
                    });
                }
            });
        }
    }, [tanggalKeluar, tanggalMasuk, setValue, nip]);


    const onSubmit = async (data: EmployeFormInput) => {
        try {
            let res;
            let uploadedImageUrl = imageUrl;

            // ⬅️ upload hanya saat submit
            if (file) {
                uploadedImageUrl = await handleUpload();
            }

            if (uploadedImageUrl) {
                data = { ...data, foto_profile: uploadedImageUrl };
            }

            if (!id) {
                res = await axios.post("/api/employees", data);
            } else {
                res = await axios.put("/api/employees/" + id, data)
            }


            if (res.status == 200) {
                if (!id)
                    toast.success("Pengguna berhasil ditambah")
                else
                    toast.success("Pengguna berhasil diubah")
                navigate("/employe")
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
            } else {
                setAlert("Terjadi kesalahan dengan server");
            }
        }

    }

    const handleUpload = async () => {
        const formData = new FormData();
        formData.append('photo', file);
        try {
            setLoadingUpload(true);
            const res = await axios.post('upload',
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            setImageUrl(res.data.imageUrl);
            return res.data.imageUrl; // ⬅️ PENTING: return URL

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingUpload(false);
        }
    };
    if (loading && isUpdate) return <Loading />
    return (
        <>
            <PageMeta
                title={`${!id ? "Tambah Karyawan" : "Ubah Karyawan"} | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle={!id ? "Tambah Karyawan" : "Ubah Karyawan"} />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/employe"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke karyawan
                </Link>
            </div>

            <div className="space-y-6">
                {alert && <div className="mb-4"><Alert variant="error" title="Pemberitahuan" message={alert} /></div>}

                <ComponentCard title={!id ? "Tambah Pengguna" : "Ubah Pengguna"}>
                    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                            <div className="col-span-2">
                                <Label>
                                    NIP <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan NIP"
                                    {...register("nip")}
                                />
                                {errors.nip && (
                                    <p className="mt-1 text-sm text-red-500">{errors.nip.message}</p>
                                )}
                            </div>
                            <div>
                                <Label>
                                    Nama Lengkap <span className="text-error-500">*</span>
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
                                <Label htmlFor="jenis_ijazah">Jenis Ijazah <span className="text-error-500">*</span></Label>
                                <Select
                                    {...register("jenis_ijazah")}
                                    options={[
                                        { label: "SD", value: "SD" },
                                        { label: "SMP", value: "SMP" },
                                        { label: "SMA", value: "SMA" },
                                        { label: "S1", value: "S1" },
                                        { label: "D1", value: "D1" },
                                        { label: "D2", value: "D2" },
                                        { label: "D3", value: "D3" },
                                        { label: "D4", value: "D4" },
                                    ]}
                                    placeholder="Pilih jenis ijazah"
                                />
                                {errors.jenis_ijazah && <p className="text-sm text-red-500 mt-1">{errors.jenis_ijazah.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="status_ijazah">Status Ijazah <span className="text-error-500">*</span></Label>
                                <Select
                                    {...register("status_ijazah")}
                                    options={[
                                        { label: "Sudah diambil", value: "sudah diambil" },
                                        { label: "Belum diambil", value: "belum diambil" },
                                    ]}
                                    placeholder="Pilih jenis ijazah"
                                />
                                {errors.status_ijazah && <p className="text-sm text-red-500 mt-1">{errors.status_ijazah.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="tanggal_masuk">Tanggal Masuk <span className="text-error-500">*</span></Label>
                                <DatePicker
                                    id={"tanggal_masuk"}
                                    mode="single"
                                    placeholder="Tanggal masuk"
                                    defaultDate={getValues("tanggal_masuk")}
                                    onChange={(date) => {
                                        setValue("tanggal_masuk", date[0] ? toLocalDate(date[0]) : date[0]);
                                    }}
                                />
                                {errors.tanggal_masuk && <p className="text-sm text-red-500 mt-1">{errors.tanggal_masuk.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="tanggal_keluar">Tanggal Keluar</Label>
                                <DatePicker
                                    id={"tanggal_keluar"}
                                    mode="single"
                                    placeholder="Tanggal keluar"
                                    defaultDate={getValues("tanggal_keluar")}
                                    hasClear
                                    onChange={(date) => {
                                        setValue("tanggal_keluar", date[0] ? toLocalDate(date[0]) : date[0]);
                                    }}
                                />
                                {errors.tanggal_keluar && <p className="text-sm text-red-500 mt-1">{errors.tanggal_keluar.message}</p>}
                            </div>


                            <div>
                                <Label>
                                    Jabatan <span className="text-error-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Masukkan jabatan"
                                    {...register("position")}
                                />
                                {errors.position && (
                                    <p className="mt-1 text-sm text-red-500">{errors.position.message}</p>
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
                                <Label>
                                    Masa kerja
                                </Label>
                                <Input
                                    readOnly
                                    placeholder="-"
                                    {...register("masa_kerja")}
                                />

                            </div>
                            <div>
                                <Label className="block mb-2 text-slate-900 dark:text-slate-100">
                                    Foto Profil
                                </Label>

                                <div className="flex flex-col items-start gap-4">
                                    {/* Input File Asli Disembunyikan */}
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        {...register("foto_profile", {
                                            onChange: (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                // Validasi Ukuran (2MB) - Berbasis Data & Keamanan
                                                if (file.size > 2 * 1024 * 1024) {
                                                    toast.error("File terlalu besar!");
                                                    setValue("foto_profile", null); // Reset value di useForm
                                                    return;
                                                }

                                                // Set preview ke dalam state useForm agar bisa di-watch
                                                setFile(file);
                                                setPreview(URL.createObjectURL(file));
                                            }
                                        })}
                                    />

                                    {/* Tombol Kustom yang Mendukung Dark Mode */}
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors
                 bg-white border border-slate-200 text-slate-900 hover:bg-slate-100
                 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700"
                                    >
                                        Pilih Foto
                                    </label>

                                    {/* Pesan Error */}
                                    {errorFile && (
                                        <p className="mt-1 text-sm text-red-500 font-medium">{errorFile}</p>
                                    )}
                                    {errors.foto_profile && (
                                        <p className="mt-1 text-sm text-red-500">{errors.foto_profile.message}</p>
                                    )}

                                    {/* Preview Image */}
                                    {preview && (
                                        <div className="relative mt-2 border-2 border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                            <img src={preview} width={120} alt="preview" className="object-cover" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <Button disabled={disabled} size="sm">Simpan</Button>
                        </div>
                    </Form>

                </ComponentCard>
            </div>
        </>
    );
}

export default EmployeForm;
