import React, { useEffect, useState } from 'react'
import axios from '../../../utils/axios';
interface Props {
    anggota_drop: number;
    anggota_lunas: number;
    group_id: number;
    target_minggu_lalu: number;
    tanggal_input: string;
    code: string;
}
function useTargetAnggota(date?: string | null, group?: number | null, id?: number) {
    const [targetMingguLalu, setTargetMingguLalu] = useState(0);
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        const hasDateAndGroup = date && group
        if (hasDateAndGroup) {
            axios.get(`api/posisi-usaha/target-anggota-minggu-lalu?tanggal_input=${date}&group_id=${group}`)
                .then((d) => {
                    setTargetMingguLalu(d.data.target_minggu_lalu || 0)
                    console.log(d);
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

        try {
            const isEdit = id
            let res;
            if (isEdit) {
                res = await axios.put(`api/posisi-usaha/target-anggota/${id}`, data)
            } else {
                res = await axios.post("api/posisi-usaha/target-anggota", data)
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
