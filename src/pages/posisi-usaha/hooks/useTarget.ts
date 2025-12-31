import React, { useEffect, useState } from 'react'
import axios from '../../../utils/axios';
import { posisiUsahaCode } from '../../../utils/constanta';
interface Props {
    drop: number;
    lunas: number;
    group_id: number;
    target_minggu_lalu: number;
    tanggal_input: string;
    code: string;
    raw_formula: string;
    total:number;
}
function useTargetAnggota(date?: string | null, group?: number | null, id?: number) {
    const [targetMingguLalu, setTargetMingguLalu] = useState(0);
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        const hasDateAndGroup = date && group
        if (hasDateAndGroup) {
            axios.get(`api/posisi-usaha/data-minggu-lalu?tanggal_input=${date}&group_id=${group}&code=${posisiUsahaCode.TARGET}`)
                .then((d) => {
                    setTargetMingguLalu(d.data.target_minggu_lalu || 0)
                })
        }
    }, [date, group]);
    useEffect(() => {
        const hasData = id
        if (hasData) {
            axios.get(`api/posisi-usaha/${id}`)
                .then((d) => setData(d.data.posisi_usaha))
        }
    }, [id]);

    const onsubmit = async (data: Props) => {
        const result = ((Number(data.drop) - Number(data.lunas)) * 0.13) + (Number(data.target_minggu_lalu))
        data.total = result
        data.raw_formula = JSON.stringify({
            drop:data.drop,
            lunas:data.lunas,
        })

        try {
            const isEdit = id
            let res;
            if (isEdit) {
                res = await axios.put(`api/posisi-usaha/save/${id}`, data)
            } else {
                res = await axios.post("api/posisi-usaha/save", data)
            }

            return res.status
        } catch (error) {
            console.log("ERROR", error);

            return 500
        }
    }

    return { targetMingguLalu, onsubmit, data }
}

export default useTargetAnggota
