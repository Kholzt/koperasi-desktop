import { useCallback, useEffect, useState } from 'react';
import axios from '../../../utils/axios';

export interface PaginationProps {
    page: number;
    totalPages: number;
    limit: number;
    total: number;
}

function usePaginatedResource(endpoint: string, itemsKey: string) {
    const [items, setItems] = useState<any[]>([]);
    const [sum, setSum] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationProps>({
        page: 1,
        totalPages: 1,
        limit: 10,
        total: 0,
    });

    const fetchPage = useCallback(async (page = 1, limit = pagination.limit, startDate = '', endDate = '') => {
        try {
            let url = `${endpoint}?page=${page}&limit=${limit}`;
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

export function useAngsuran() {
    return usePaginatedResource('/api/posisi-usaha-angsuran', 'angsuran');
}

export function useModalDo() {
    return usePaginatedResource('/api/posisi-usaha-modaldo', 'modaldo');
}
export  function usePosisiUsaha(code :string) {
    const [amount, setAmount] = useState<number>(0);
    useEffect(() => {
        axios(`/api/posisi-usaha?code=${code}`).then((d)=>setAmount(d.data?.posisiUsaha?.amount ?? 0))
    }, []);

    return  amount;
}
