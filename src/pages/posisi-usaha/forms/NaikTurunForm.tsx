import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Label from '../../../components/form/Label';
import Input from '../../../components/form/input/InputField';
import { formatCurrency, toLocalDate } from '../../../utils/helpers';
import useNaikTurun from '../hooks/useNaikTurun';
import DatePicker from '../../../components/form/date-picker';
import Button from '../../../components/ui/button/Button';
import { toast } from 'react-toastify';

interface NaikTurunFormProps {
    id?: number;
    onClose: (status: boolean) => void;
    groups: any[];
}

interface FormValues {
    storting: string;
    target: string;
    group_id: string;
    tanggal_input: string;
    result: string;
}

export default function NaikTurunForm({ id, onClose, groups }: NaikTurunFormProps) {
    const {
        register,
        setValue,
        watch,
        handleSubmit,
    } = useForm<FormValues>();

    const watchTanggal = watch("tanggal_input");
    const watchGroup = watch("group_id");

    // Hook handles fetching logic.
    // If id is present, it fetches by ID. If not, it fetches by date/group if provided.
    const { data, onsubmit } = useNaikTurun(watchTanggal, Number(watchGroup), id);

    useEffect(() => {
        if (data) {
            const record = data as any;
            const storting = record.storting ?? 0;
            const target = record.target ?? 0;
            const result = storting - target;

            setValue("storting", formatCurrency(storting, false));
            setValue("target", formatCurrency(target, false));
            setValue("result", formatCurrency(result, false));

            if (id) {
                const groupName = groups.find(g => g.value == record.group_id)?.label || "-";
                setValue("group_id", groupName);
                setValue("tanggal_input", toLocalDate(new Date(record.tanggal_input)));
            }
        }
    }, [data, setValue, groups, id]);

    const handleDate = (date: any) => {
        setValue("tanggal_input", toLocalDate(date[0]));
    };

    const onSubmitForm = async () => {
        const status = await onsubmit();
        if (status === 200 || status === 201) {
            toast.success("Data Naik/Turun berhasil disimpan");
            onClose(false);
        } else if (status === 400) {
            toast.error("Data dengan tanggal tersebut sudah ada");
        } else {
            toast.error("Gagal menyimpan data");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="bg-white p-6 rounded-lg shadow-sm dark:bg-gray-800">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3 dark:border-gray-700">
                <h1 className='text-2xl font-semibold text-gray-800 dark:text-white'>
                    {id ? "Detail Naik / Turun" : "Generate Naik / Turun"}
                </h1>
                {!id && (
                    <Button
                        type="button"
                        onClick={() => {
                            // Logic is already reactive, but if user wants a "Generate" button
                            // they might mean the one that actually triggers the calculation.
                            // Currently it happens automatically. We can just say "Sudah terhitung otomatis"
                            // or leave it as a placeholder for explicit trigger if preferred.
                            toast.info("Data terhitung otomatis berdasarkan pilihan");
                        }}
                        className="text-xs py-1 px-3"
                    >
                        Generate / Hitung
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="flex flex-col">
                    <Label>Tanggal Input</Label>
                    {id ? (
                        <Input
                            type="text"
                            {...register("tanggal_input")}
                            readOnly
                            disabled
                        />
                    ) : (
                        <DatePicker
                            id={"tanggalInput"}
                            mode="single"
                            placeholder="Pilih tanggal"
                            onChange={handleDate}
                            defaultDate={watchTanggal}
                        />
                    )}
                </div>

                <div className="flex flex-col">
                    <Label>Kelompok</Label>
                    {id ? (
                        <Input {...register("group_id")} readOnly disabled />
                    ) : (
                        <select
                            {...register("group_id")}
                            className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-5 font-medium outline-none transition focus:border-brand-500 active:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:focus:border-brand-500"
                        >
                            <option value="">Pilih Kelompok</option>
                            {groups.map((group) => (
                                <option key={group.value} value={group.value}>
                                    {group.label}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                <div className="flex flex-col">
                    <Label>Storting</Label>
                    <Input type="text" {...register("storting")} readOnly disabled />
                </div>

                <div className="flex flex-col">
                    <Label>Target</Label>
                    <Input type="text" {...register("target")} readOnly disabled />
                </div>

                <div className="flex flex-col md:col-span-2">
                    <Label>Naik / Turun (Storting - Target)</Label>
                    <Input
                        type="text"
                        {...register("result")}
                        readOnly
                        disabled
                        className="font-bold text-lg"
                    />
                    <p className={`mt-2 font-bold ${data?.result < 0 ? "text-red-500" : "text-gray-800 dark:text-white"
                        }`}>
                        {data?.result !== undefined ? (data.result < 0 ? "Turun" : "Naik") : ""}
                    </p>
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
                {!id && (
                    <Button
                        type="submit"
                        disabled={!data}
                        className="px-6 py-2 text-white rounded-md transition shadow-md"
                    >
                        Simpan Result
                    </Button>
                )}
            </div>
        </form>
    );
}
