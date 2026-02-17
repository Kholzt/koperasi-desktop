import React, { useEffect, useState } from 'react'
import axios from '../../../utils/axios';
import { posisiUsahaCode } from '../../../utils/constanta';
import { unformatCurrency } from '../../../utils/helpers';
interface Props {
    drop: number | string;
    lunas: number | string;
    group_id: number;
    target_minggu_lalu: number | string;
    tanggal_input: string;
    code: string;
    raw_formula: string;
    total:number;
}
function useTarget(date?: string | null, group?: number | null, id?: number) {
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
        const drop = unformatCurrency(data.drop.toString());
        const lunas = unformatCurrency(data.lunas.toString());
        const target_minggu_lalu = unformatCurrency(data.target_minggu_lalu.toString());

        const result = ((drop - lunas) * 0.13) + target_minggu_lalu
        data.total = result
        data.raw_formula = JSON.stringify({
            drop:drop,
            lunas:lunas,
        })

        console.log("use Target",data);

        try {
            const isEdit = id
            let res;
            if (isEdit) {
                res = await axios.put(`api/posisi-usaha/save/${id}`, data)
            } else {
                res = await axios.post("api/posisi-usaha/save", data)
            }

            return res.status
        } catch (error: any) {
            console.log("ERROR", error);
            return error.response?.status || 500;
        }
    }

    return { targetMingguLalu, onsubmit, data }
}

export default useTarget
