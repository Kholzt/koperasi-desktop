import { useCallback, useEffect, useState } from 'react';
import axios from '../../../utils/axios';
import { GroupProps } from '../../../utils/types';

export interface PaginationProps {
    page: number;
    totalPages: number;
    limit: number;
    total: number;
}

export function usePaginatedResource(endpoint: string, itemsKey: string,code:string) {
    const [items, setItems] = useState<any[]>([]);
    const [sum, setSum] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0,
    });

    const fetchPage = useCallback(async (page = 1, limit = pagination.limit, startDate = '', endDate = '',group='') => {
        try {
            let url = `${endpoint}?page=${page}&limit=${limit}&code=${code}`;
            if (group) url += `&group_id=${group}`;
            if (startDate) url += `&startDate=${startDate}`;
            if (endDate) url += `&endDate=${endDate}`;

            const res: any = await axios.get(url);
            const data = res.data || {};
            const body = data.data || data;
            const list = body[itemsKey] || body.items || body.areas || [];
            const jumlah = body.jumlah ?? 0;

            // prefer explicit pagination object from API
            const apiPagination = data.pagination || body.pagination;
            if (apiPagination) {
                setPagination({
                    page: apiPagination.page || page,
                    totalPages: apiPagination.totalPages || Math.max(1, Math.ceil((apiPagination.total || 0) / (apiPagination.limit || limit))),
                    limit: apiPagination.limit || limit,
                    total: apiPagination.total || (Array.isArray(list) ? list.length : 0),
                });
            } else {
                const total = body.total ?? body.total_items ?? (Array.isArray(list) ? list.length : 0);
                const per_page = body.per_page || limit;
                const current = body.current_page || page;
                const last = body.last_page || Math.max(1, Math.ceil((total || 0) / per_page));
                setPagination({ page: current, totalPages: last, limit: per_page, total: total });
            }
            setItems(list);
            setSum(jumlah);
        } catch (err) {
            // silent for now — caller can handle errors if needed
            setItems([]);
            setSum(0);
            setPagination({ page: 1, totalPages: 1, limit: limit, total: 0 });
        }
    }, [endpoint, itemsKey, pagination.limit]);

    return {
        items,
        sum,
        pagination,
        fetchPage,
        setPagination,
    } as const;
}

export function usePosisiUsaha(code:string) {
    return usePaginatedResource('/api/posisi-usaha', 'history',code);
}
export  function usePosisiUsahaToday(code :string) {
    const [amount, setAmount] = useState<number>(0);
    useEffect(() => {
        axios(`/api/posisi-usaha-today?code=${code}`).then((d)=>setAmount(d.data?.posisiUsaha?.amount ?? 0))
    }, []);

    return  amount;
}
export  function usePosisiUsahaGroup() {
    const [groups, setGroups] = useState<{ label: string, value: string }[]>([]);
    useEffect(() => {
        axios.get("/api/groups?limit=20000000").then(res => {
            setGroups(res.data.groups.map((group: GroupProps) => ({ label: group.group_name, value: group.id })))
    });    }, []);

    return  {groups};
}
