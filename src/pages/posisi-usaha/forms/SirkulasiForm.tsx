import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import Label from '../../../components/form/Label';
import Select from '../../../components/form/Select';
import DatePicker from '../../../components/form/date-picker';
import Input from '../../../components/form/input/InputField';
import Button from '../../../components/ui/button/Button';
import { posisiUsahaCode } from '../../../utils/constanta';
import { formatCurrency, toLocalDate, unformatCurrency } from '../../../utils/helpers';
import useSirkulasi from '../hooks/useSirkulasi';


interface Props {
    drop: string;
    storting: string;
    group_id: number;
    target_minggu_lalu: string;
    tanggal_input: string;
    code: string;
    raw_formula: string;
    total: number;

}
const schema: yup.SchemaOf<Props> = yup.object({
    drop: yup.string()
        .required('Drop wajib diisi'),
    storting: yup.string()
        .required('Storting wajib diisi'),
    group_id: yup.string()
        .required('Kelompok  wajib diisi'),
    target_minggu_lalu: yup.string()
        .required('Sirkulasi minggu lalu  wajib diisi'),
    tanggal_input: yup.string()
        .required('Tanggal input lalu  wajib diisi'),
});
interface PropsForm {
    id?: number,
    onClose: (status: boolean) => void,
    groups: any[]
}
export default function SirkulasiForm({ id, onClose, groups }: PropsForm) {
    const { handleSubmit, register, setValue, watch, getValues, formState: { errors } } = useForm<Props>({
        resolver: yupResolver(schema),
        defaultValues: {
            code: posisiUsahaCode.SIRKULASI,
            drop: "0",
        }
    });

    const watchTanggal = watch("tanggal_input");
    const watchGroup = watch("group_id");
    const drop_watch = watch("drop");
    const { sirkulasiMingguLalu, stortingThisWeekTotal, onsubmit, data } = useSirkulasi(watchTanggal, watchGroup, id);

    React.useEffect(() => {
        setValue("target_minggu_lalu", formatCurrency(sirkulasiMingguLalu ?? 0, false), { shouldDirty: true });
        setValue("storting", formatCurrency(stortingThisWeekTotal ?? 0, false), { shouldDirty: true });
        console.log(formatCurrency(sirkulasiMingguLalu), formatCurrency(stortingThisWeekTotal));

        if (data) {
            const rawFormula = data.raw_formula;
            
            setValue("drop", rawFormula?.drop ?? 0, { shouldDirty: true })
            // setValue("storting", rawFormula?.storting ?? 0, { shouldDirty: true })
            setValue("group_id", data.group_id, { shouldDirty: true })
            setValue("tanggal_input", toLocalDate(new Date(data.tanggal_input)), { shouldDirty: true })
        }
    }, [sirkulasiMingguLalu, setValue, data]);

     React.useEffect(() => {
            const drop_unformat = unformatCurrency(String(drop_watch));
            setValue("drop", formatCurrency(drop_unformat, false));
        }, [drop_watch]);

    // React.useEffect(() => {
    //     setValue("target_minggu_lalu", sirkulasiMingguLalu ?? 0);
    // }, [sirkulasiMingguLalu]);

    // React.useEffect(() => {
    //     setValue("storting", stortingThisWeekTotal ?? 0);
    // }, [stortingThisWeekTotal]);

    React.useEffect(() => {
        if (!watchTanggal || !watchGroup) return;
        const unformattedSirkulasi= unformatCurrency(String(sirkulasiMingguLalu?? 0)) ;
        const unformattedStorting = unformatCurrency(String(stortingThisWeekTotal ?? 0));
        setValue("target_minggu_lalu", formatCurrency(unformattedSirkulasi ?? 0, false));
        setValue("storting", formatCurrency(unformattedStorting ?? 0, false));
    }, [watchTanggal, watchGroup, sirkulasiMingguLalu, stortingThisWeekTotal]);


    const handleDate = (date: any) => {
        setValue("tanggal_input", toLocalDate(date[0]));
    };
    const onSubmitForm = async (data: Props) => {
        data.drop = data.drop.replace(/[^0-9]/g, '');
        data.storting = data.storting.replace(/[^0-9]/g, '');
        data.target_minggu_lalu = data.target_minggu_lalu.replace(/[^0-9]/g, '');
        const status = await onsubmit(data)
        if (status == 200) {
            toast.success("Sirkulasi  berhasil disimpan")
            onClose(false)
        } else {
            toast.error("Sirkulasi  gagal disimpan")
        }
    }
    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-900">
            <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-700">
                <h1 className='text-2xl font-semibold text-gray-800 dark:text-white'>Sirkulasi</h1>
                <span className="text-sm text-gray-500">* Wajib diisi</span>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">

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
                    <Label>Nominal Drop <span className="text-error-500">*</span></Label>
                    <Input
                        type="text"
                        placeholder="0"
                        {...register("drop")}
                    />
                    {errors.drop && (
                        <p className="mt-1 text-xs text-red-500">{errors.drop.message}</p>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                {/* Kolom 5: Sirkulasi Minggu Lalu (Full Width atau 1 Kolom) */}
                <div className="flex flex-col bg-gray-50 p-4 rounded-md border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                    <Label className="text-gray-600">Storting (Terisi Otomatis)</Label>
                    <Input
                        className="font-bold text-lg bg-transparent border-none"
                        {...register("storting")}
                        readOnly

                    />
                </div>

                {/* Kolom 6: Sirkulasi Minggu Lalu (Full Width atau 1 Kolom) */}
                <div className="flex flex-col bg-gray-50 p-4 rounded-md border border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                    <Label className="text-gray-600">Sirkulasi Minggu Lalu (Terisi Otomatis)</Label>
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
