import React, { useEffect, useState } from 'react'
import axios from '../../../utils/axios';
import { posisiUsahaCode } from '../../../utils/constanta';
interface Props {

    storting: number;
    target: number;
    group_id: number;
    target_minggu_lalu: number;
    tanggal_input: string;
    code: string;
    raw_formula: string;
    total:number;
}
function useIp(date?: string | null, group?: number | null, id?: number) {
    const [stortingMingguIni, setStortingMingguIni] = useState(0);
    const [targetMingguIni, setTargetMingguIni] = useState(0);
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        const hasDateAndGroup = date && group
        if (hasDateAndGroup) {
            axios.get(`api/posisi-usaha/data-this-week?tanggal_input=${date}&group_id=${group}&code=${posisiUsahaCode.STORTING}`)
                .then((d) => {
                    setStortingMingguIni(d.data.amount || 0)
                })
            axios.get(`api/posisi-usaha/data-this-week?tanggal_input=${date}&group_id=${group}&code=${posisiUsahaCode.TARGET}`)
                .then((d) => {
                    setTargetMingguIni(d.data.amount || 0)
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
        const storting = Number(data.storting);
        const target = Number(data.target);
        data.total = target > 0 ? ((storting / target) * 100).toFixed(1) : 0;
        data.raw_formula = JSON.stringify({
            storting:data.storting,
            target:data.target,
        })
console.log(data,storting,target);
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

    return { stortingMingguIni,targetMingguIni, onsubmit, data }
}

export default useIp
