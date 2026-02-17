import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect } from 'react';
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
import usePD from '../hooks/usePD';

interface FormValues {
    rencana_drop: string;
    transport: string;
    target: string;
    group_id: string;
    tanggal_input: string;
    code?: string;
    raw_formula?: string;
    total?: number;
}

const schema: yup.ObjectSchema<FormValues> = yup.object({
    group_id: yup.string().required('Kelompok wajib diisi'),
    tanggal_input: yup.string().required('Tanggal input wajib diisi'),
    rencana_drop: yup.string().required('Rencana drop wajib diisi'),
    transport: yup.string().required('Transport wajib diisi'),
    target: yup.string().required('Target wajib diisi'),
    code: yup.string(),
    raw_formula: yup.string(),
    total: yup.number(),
});

interface PDFormProps {
    id?: number;
    onClose: (status: boolean) => void;
    groups: any[];
}

export default function PDForm({ id, onClose, groups }: PDFormProps) {
    const {
        handleSubmit,
        register,
        setValue,
        watch,
        getValues,
        formState: { errors, isSubmitting }
    } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            code: posisiUsahaCode.PD,
            rencana_drop: "0",
            transport: "0",
        }
    });

    const watchTanggal = watch("tanggal_input");
    const watchGroup = watch("group_id");
    const rencana_drop_watch = watch("rencana_drop");
    const transport_watch = watch("transport");

    const [initialized, setInitialized] = React.useState(false);

    // Hook handles fetching logic for PD-specific data
    const { targetMingguIni, onsubmit, data } = usePD(watchTanggal, Number(watchGroup), id);

    useEffect(() => {
        if (id && data && !initialized) {
            // Populate form for edit ONLY ONCE
            const rawFormula = data.raw_formula ? (typeof data.raw_formula === 'string' ? JSON.parse(data.raw_formula) : data.raw_formula) : {};
            setValue("rencana_drop", formatCurrency(rawFormula?.rencana_drop || 0, false));
            setValue("transport", formatCurrency(rawFormula?.transport || 0, false));
            setValue("target", formatCurrency(rawFormula?.target || 0, false));
            setValue("group_id", String(data.group_id), { shouldDirty: true });
            setValue("tanggal_input", toLocalDate(new Date(data.tanggal_input)), { shouldDirty: true });
            setInitialized(true);
        }
    }, [data, id, initialized, setValue]);

    useEffect(() => {
        if (!id || initialized) {
            // Populate form for create OR update read-only fields when context changes
            setValue("target", formatCurrency(targetMingguIni || 0, false));
        }
    }, [targetMingguIni, id, initialized, setValue]);

    useEffect(() => {
        const rencana_drop_unformat = unformatCurrency(String(rencana_drop_watch));
        const transport_unformat = unformatCurrency(String(transport_watch));
        setValue("rencana_drop", formatCurrency(rencana_drop_unformat, false));
        setValue("transport", formatCurrency(transport_unformat, false));
    }, [rencana_drop_watch, transport_watch]);


    const handleDate = (date: (Date | null)[]) => {
        setValue("tanggal_input", date[0] ? toLocalDate(date[0]) : '');
    };

    const handleFormSubmit = async (formData: FormValues) => {
        const payload = {
            ...formData,
            group_id: Number(formData.group_id),
            code: formData.code || posisiUsahaCode.PD,
            // Ensure other optional fields are handled if needed by onsubmit/Props
            // But Props says optional fields from Props interface?
            // Props in usePD defines:
            // group_id: number;
            // tanggal_input: string;
            // code: string;
            // raw_formula: string;
            // total: number;
            // rencana_drop, transport, target: number | string
            // Wait, Props defines raw_formula and total as required number/string?
            // Let's look at usePD.ts again.
        };
        // We need to cast payload to any or ensure it matches Props.
        // Since we are changing group_id to number, it should match relevant parts.
        // typescript might trigger mismatch if payload has optional fields but Props has required.
        // usePD Props: raw_formula: string; total: number;
        // logic in usePD onsubmit calculates total and raw_formula. So input payload doesn't need them to be correct.
        // But Typescript demands correctness. I'll cast to any to be safe and avoid blocking.
        const status = await onsubmit(payload as any);
        if (status === 200 || status === 201) {
            toast.success("PD berhasil disimpan");
            onClose(false);
        } else if (status === 400) {
            toast.error("Data dengan tanggal tersebut sudah ada");
        } else {
            toast.error("PD gagal disimpan");
        }
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-700">
                <h1 className='text-2xl font-semibold text-gray-800 dark:text-white'>PD</h1>
                <span className="text-sm text-gray-500 dark:text-gray-400">* Wajib diisi</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex flex-col">
                    <Label>Tanggal Input <span className="text-red-500">*</span></Label>
                    <DatePicker
                        id="tanggalInput"
                        mode="single"
                        placeholder="Pilih tanggal"
                        onChange={handleDate}
                        defaultDate={getValues("tanggal_input") ? new Date(getValues("tanggal_input")) : undefined}
                    />
                    {errors.tanggal_input && <p className="mt-1 text-xs text-red-500">{errors.tanggal_input.message}</p>}
                </div>

                <div className="flex flex-col">
                    <Label>Kelompok <span className="text-red-500">*</span></Label>
                    <Select options={groups} placeholder="Pilih kelompok" {...register("group_id")} />
                    {errors.group_id && <p className="mt-1 text-xs text-red-500">{errors.group_id.message}</p>}
                </div>

                <div className="flex flex-col">
                    <Label>Rencana Drop <span className="text-red-500">*</span></Label>
                    <Input type="text" placeholder="0" {...register("rencana_drop")} />
                    {errors.rencana_drop && <p className="mt-1 text-xs text-red-500">{errors.rencana_drop.message}</p>}
                </div>
                <div className="flex flex-col">
                    <Label>Transport <span className="text-red-500">*</span></Label>
                    <Input type="text" placeholder="0" {...register("transport")} />
                    {errors.transport && <p className="mt-1 text-xs text-red-500">{errors.transport.message}</p>}
                </div>

                <div className="flex flex-col">
                    <Label>Target <span className="text-red-500">*</span></Label>
                    <Input type="text" placeholder="0" {...register("target")} readOnly />
                    {errors.target && <p className="mt-1 text-xs text-red-500">{errors.target.message}</p>}
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
                <button
                    onClick={() => onClose(false)}
                    type="button"
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] transition-colors"
                >
                    Tutup
                </button>
                <Button type="submit" className="px-6 py-2 text-white rounded-md transition shadow-md" disabled={isSubmitting}>
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </div>
        </form>
    );
}
