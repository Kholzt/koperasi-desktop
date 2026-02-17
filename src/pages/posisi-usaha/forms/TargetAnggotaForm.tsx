import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import DatePicker from '../../../components/form/date-picker';
import { toLocalDate } from '../../../utils/helpers';
import Label from './../../../components/form/Label';
import Select from './../../../components/form/Select';
import Input from './../../../components/form/input/InputField';
import useTargetAnggota from './../hooks/useTargetAnggota';
import React from 'react';
import Button from '../../../components/ui/button/Button';
import { toast } from 'react-toastify';
import { posisiUsahaCode } from '../../../utils/constanta';


interface Props {
    anggota_drop: number;
    anggota_lunas: number;
    group_id: number;
    target_minggu_lalu: number;
    tanggal_input: string;
    code: string;
    raw_formula: string;
    total: number;

}
const schema: yup.SchemaOf<Props> = yup.object({
    anggota_drop: yup.string()
        .required('Anggota drop wajib diisi'),
    anggota_lunas: yup.string()
        .required('Anggota lunas wajib diisi'),
    group_id: yup.string()
        .required('Kelompok  wajib diisi'),
    target_minggu_lalu: yup.string()
        .required('Target minggu lalu  wajib diisi'),
    tanggal_input: yup.string()
        .required('Tanggal input lalu  wajib diisi'),
    code: yup.string(),
    raw_formula: yup.string(),
    total: yup.number(),
});
interface PropsForm {
    id?: number,
    onClose: (status: boolean) => void,
    groups: any[]
}
export default function TargetAnggotaForm({ id, onClose, groups }: PropsForm) {
    const { handleSubmit, register, setValue, watch, getValues, formState: { errors } } = useForm<Props>({
        resolver: yupResolver(schema),
        defaultValues: {
            code: posisiUsahaCode.TARGET_ANGGOTA
        }
    });

    const watchTanggal = watch("tanggal_input");
    const watchGroup = watch("group_id");
    const [initialized, setInitialized] = React.useState(false);
    const { targetMingguLalu, onsubmit, data } = useTargetAnggota(watchTanggal, watchGroup, id);

    React.useEffect(() => {
        if (id && data && !initialized) {
            const rawFormula = data.raw_formula;
            setValue("anggota_drop", rawFormula?.anggota_drop || 0, { shouldDirty: true })
            setValue("anggota_lunas", rawFormula?.anggota_lunas || 0, { shouldDirty: true })
            setValue("group_id", data.group_id, { shouldDirty: true })
            setValue("tanggal_input", toLocalDate(new Date(data.tanggal_input)), { shouldDirty: true })
            setValue("target_minggu_lalu", data.target_minggu_lalu || 0, { shouldDirty: true });
            setInitialized(true);
        }
    }, [data, id, initialized, setValue]);

    React.useEffect(() => {
        if (!id || initialized) {
            setValue("target_minggu_lalu", targetMingguLalu || 0, { shouldDirty: true });
        }
    }, [targetMingguLalu, id, initialized, setValue]);

    const handleDate = (date: any) => {
        setValue("tanggal_input", toLocalDate(date[0]));
    };
    const onSubmitForm = async (data: Props) => {
        const status = await onsubmit(data)
        if (status === 200 || status === 201) {
            toast.success("Target anggota berhasil disimpan")
            onClose(false)
        } else if (status === 400) {
            toast.error("Data dengan tanggal tersebut sudah ada");
        } else {
            toast.error("Target anggota gagal disimpan")
        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h1 className='text-2xl font-semibold text-gray-800'>Target Anggota</h1>
                <span className="text-sm text-gray-500">* Wajib diisi</span>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                {/* Kolom 1: Tanggal */}
                <div className="flex flex-col">
                    <Label>Tanggal Input <span className="text-error-500">*</span></Label>
                    <DatePicker
                        id={"tanggalInput"}
                        mode="single"
                        placeholder="Pilih tanggal"
                        onChange={handleDate}
                        defaultDate={getValues("tanggal_input")}
                    />
                    {errors.tanggal_input && (
                        <p className="mt-1 text-xs text-red-500">{errors.tanggal_input.message}</p>
                    )}
                </div>

                {/* Kolom 2: Kelompok */}
                <div className="flex flex-col">
                    <Label>Kelompok <span className="text-error-500">*</span></Label>
                    <Select options={groups} placeholder="Pilih kelompok" {...register("group_id")} />
                    {errors.group_id && (
                        <p className="mt-1 text-xs text-red-500">{errors.group_id.message}</p>
                    )}
                </div>

                {/* Kolom 3: Anggota Drop */}
                <div className="flex flex-col">
                    <Label>Anggota Drop <span className="text-error-500">*</span></Label>
                    <Input
                        type="number"
                        placeholder="0"
                        {...register("anggota_drop")}
                    />
                    {errors.anggota_drop && (
                        <p className="mt-1 text-xs text-red-500">{errors.anggota_drop.message}</p>
                    )}
                </div>

                {/* Kolom 4: Anggota Lunas */}
                <div className="flex flex-col">
                    <Label>Anggota Lunas <span className="text-error-500">*</span></Label>
                    <Input
                        type="number"
                        placeholder="0"
                        {...register("anggota_lunas")}
                    />
                    {errors.anggota_lunas && (
                        <p className="mt-1 text-xs text-red-500">{errors.anggota_lunas.message}</p>
                    )}
                </div>

                {/* Kolom 5: Target Minggu Lalu (Full Width atau 1 Kolom) */}
                <div className="flex flex-col md:col-span-2 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <Label className="text-gray-600">Target Minggu Lalu (Terisi Otomatis)</Label>
                    <Input
                        className="font-bold text-lg bg-transparent border-none"
                        {...register("target_minggu_lalu")}
                        readOnly

                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3">
                <button
                    onClick={() => onClose(false)}
                    type="button"
                    className="fle rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                    Tutup
                </button>
                <Button
                    type="submit"
                    className="px-6 py-2  text-white rounded-md  transition shadow-md"
                >
                    Simpan
                </Button>
            </div>
        </form>
    );
}
