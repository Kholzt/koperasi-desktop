import { useEffect, useState } from 'react';
import axios from '../../../utils/axios';
import { posisiUsahaCode } from '../../../utils/constanta';


function useNaikTurun(_date?: string | null, _group?: number | null, id?: number) {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (id) {
                // View Mode: Fetch by ID
                try {
                    const refRes = await axios.get(`api/posisi-usaha/${id}`);
                    const refData = refRes.data.posisi_usaha;

                    if (!refData) return;

                    const rawFormula = refData.raw_formula ? (typeof refData.raw_formula === 'string' ? JSON.parse(refData.raw_formula) : refData.raw_formula) : {};

                    setData({
                        id: refData.id,
                        tanggal_input: refData.tanggal_input,
                        group_id: refData.group_id,
                        storting: rawFormula.storting || 0,
                        target: rawFormula.target || 0,
                        result: refData.amount,
                        raw_formula: refData.raw_formula
                    });

                } catch (error) {
                    console.error("Error fetching detail Naik/Turun by ID", error);
                }
            } else if (_date && _group) {
                // Generate Mode: Fetch by Date and Group
                await fetchDetails(_date, _group);
            }
        };

        const fetchDetails = async (date: string, groupId: number, currentId?: number) => {
             try {
                const params = `?page=1&limit=1&group_id=${groupId}&startDate=${date}&endDate=${date}`;

                const [resStorting, resTarget] = await Promise.all([
                     axios.get(`/api/posisi-usaha${params}&code=${posisiUsahaCode.STORTING}`),
                     axios.get(`/api/posisi-usaha${params}&code=${posisiUsahaCode.TARGET}`)
                ]);

                const stortingItem = resStorting.data?.history?.[0];
                const targetItem = resTarget.data?.history?.[0];

                const storting = stortingItem ? Number(stortingItem.jumlah) : 0;
                const target = targetItem ? Number(targetItem.jumlah) : 0;

                setData({
                    id: currentId,
                    tanggal_input: date,
                    group_id: groupId,
                    storting: storting,
                    target: target,
                    result: storting - target,
                    raw_formula: JSON.stringify({ storting, target })
                });
             } catch (error) {
                 console.error("Error fetching detail Naik/Turun by Date/Group", error);
             }
        }

        fetchData();
    }, [id, _date, _group]);

    const onsubmit = async () => {
        if (!data) return 400;
        try {
            const payload = {
                group_id: data.group_id,
                tanggal_input: data.tanggal_input,
                code: posisiUsahaCode.NAIK_TURUN,
                total: data.result,
                raw_formula: data.raw_formula
            };
            // console.log(payload);

            // return;
            const response = await axios.post('/api/posisi-usaha/save', payload);
            return response.status;
        } catch (error: any) {
            console.log("ERROR", error);
            return error.response?.status || 500;
        }
    }

    return { onsubmit, data }
}


export default useNaikTurun;
