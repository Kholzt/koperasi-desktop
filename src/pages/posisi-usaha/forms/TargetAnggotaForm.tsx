import React from 'react'
import { useForm } from 'react-hook-form';
import Input from './../../../components/form/input/InputField';
import Label from './../../../components/form/Label';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Select from './../../../components/form/Select';


interface Props {
    anggota_drop: string;
    anggota_lunas: string;
    group_id: string;
}
const schema: yup.SchemaOf<Props> = yup.object({
    anggota_drop: yup.string()
        .required('Anggota drop wajib diisi'),
    anggota_lunas: yup.string()
        .required('Anggota lunas wajib diisi'),
    group_id: yup.string()
        .required('Anggota  wajib diisi'),
});
interface PropsForm {
    dataEdit?: any
}
export default function TargetAnggotaForm({ dataEdit }: PropsForm) {
    const { handleSubmit, register, formState: { errors } } = useForm<Props>({
        resolver: yupResolver(schema),
    })
    const onsubmit = (data: Props) => {

    }
    return (
        <form onSubmit={handleSubmit(onsubmit)}>
            <h1 className='text-xl'>Target Anggota</h1>
            <div>
                <Label>
                    Kelompok <span className="text-error-500">*</span>
                </Label>
                <Select options={[]} placeholder="Pilih kelompok" {...register("group_id")} />
                {errors.group_id && (
                    <p className="mt-1 text-sm text-red-500">{errors.group_id.message}</p>
                )}
            </div>
            <div>
                <Label>
                    Anggota Drop <span className="text-error-500">*</span>
                </Label>
                <Input
                    placeholder="Masukkan anggota drop"
                    {...register("anggota_drop")}
                />
                {errors.anggota_drop && (
                    <p className="mt-1 text-sm text-red-500">{errors.anggota_drop.message}</p>
                )}
            </div>
            <div>
                <Label>
                    Anggota Lunas <span className="text-error-500">*</span>
                </Label>
                <Input
                    placeholder="Masukkan anggota lunas"
                    {...register("anggota_lunas")}
                />
                {errors.anggota_lunas && (
                    <p className="mt-1 text-sm text-red-500">{errors.anggota_lunas.message}</p>
                )}
            </div>
        </form>
    )
}
