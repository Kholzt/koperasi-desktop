import { useEffect, useState } from 'react'
import axios from '../../../utils/axios';
import { posisiUsahaCode } from '../../../utils/constanta';
import { unformatCurrency } from '../../../utils/helpers';

interface Props {
    pd: number | string;
    storting: number | string;
    drop: number | string;
    transport: number | string;
    group_id: number;
    tanggal_input: string;
    code: string;
    raw_formula: string;
    total: number;
}

function useSU(date?: string | null, group?: number | null, id?: number) {
    const [stortingMingguIni, setStortingMingguIni] = useState(0);
    const [pdMingguIni, setPdMingguIni] = useState(0);

    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const hasDateAndGroup = date && group
        if (hasDateAndGroup) {
            // Get Storting
            axios.get(`api/posisi-usaha/data-this-week?tanggal_input=${date}&group_id=${group}&code=${posisiUsahaCode.STORTING}`)
                .then((d) => {
                    setStortingMingguIni(d.data.amount || 0)
                })

            // Get PD and Transport from PD
            axios.get(`api/posisi-usaha/data-this-week?tanggal_input=${date}&group_id=${group}&code=${posisiUsahaCode.PD}`)
                .then((d) => {
                    setPdMingguIni(d.data.amount || 0)
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
        const pd = unformatCurrency(data.pd.toString());
        const storting = unformatCurrency(data.storting.toString());
        const drop = unformatCurrency(data.drop.toString());
        const transport = unformatCurrency(data.transport.toString());

        // Formula: SU = PD + Storting - Drop - Transport
        data.total = (pd + storting) - drop - transport;

        data.raw_formula = JSON.stringify({
            pd: pd,
            storting: storting,
            drop: drop,
            transport: transport
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

    return { stortingMingguIni, pdMingguIni,onsubmit, data }
}

export default useSU
