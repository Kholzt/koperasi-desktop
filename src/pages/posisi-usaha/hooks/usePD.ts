import { useEffect, useState } from 'react'
import axios from '../../../utils/axios';
import { posisiUsahaCode } from '../../../utils/constanta';
import { unformatCurrency } from '../../../utils/helpers';
interface Props {
    rencana_drop: number | string;
    transport: number | string;
    target: number | string;
    group_id: number;
    tanggal_input: string;
    code: string;
    raw_formula: string;
    total: number;
}
function usePD(date?: string | null, group?: number | null, id?: number) {
    const [targetMingguIni, setTargetMingguIni] = useState(0);
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        const hasDateAndGroup = date && group
        if (hasDateAndGroup) {
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
        const rencana_drop = unformatCurrency(data.rencana_drop.toString());
        const transport = unformatCurrency(data.transport.toString());
        const target = unformatCurrency(data.target.toString());
        data.total =  ((rencana_drop + transport) - target) ;
        data.raw_formula = JSON.stringify({
            rencana_drop:rencana_drop,
            transport:transport,
            target:target,
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
        } catch (error: any) {
            console.log("ERROR", error);
            return error.response?.status || 500;
        }
    }

    return { targetMingguIni, onsubmit, data }
}

export default usePD
