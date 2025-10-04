import { CategoryProps, GroupProps, PosProps, TransactionProps } from "../../utils/types";
import axios from "../../utils/axios";
import { useTheme } from "../../context/ThemeContext";
import { useEffect, useState } from "react";
import { toLocalDate } from "../../utils/helpers";


export function getData(){
    const [filter, setFilter] = useState<{ categories: string[], transaction_type: string[], groups: string[], pos: string | null, date: { startDate: string | null, endDate: string | null } }>({
        categories: [],
        pos: null,
        transaction_type: [],
        groups: [],
        date: { startDate: null, endDate: null },
    });
    const [transactions, setTransactions] = useState<TransactionProps[]>([]);
    const [categories, setCategories] = useState<{ text: string, value: string }[]>([]);
    const [groups, setGroups] = useState<{ text: string, value: string }[]>([]);
    const [pos, setPos] = useState<{ label: string, value: string }[]>([]);
    const [isAngsuran, setIsAngsuran] = useState(false);
    const { reload } = useTheme();

    useEffect(() => {
        const params = {
            startDate: filter.date.startDate,
            endDate: filter.date.endDate,
            categories: filter.categories, // array
            transaction_type: filter.transaction_type, // array
            groups: filter.groups,
            pos: filter.pos
        };
        axios
            .get('/api/laba-rugi', { params })
            .then((res: any) => {
                setTransactions(res.data.transactions);
            });

        axios
            .get(`/api/categories?limit=20000000`)
            .then((res: any) => {
                setCategories(res.data.categories.map((category: CategoryProps) => ({ text: category.name, value: category.id })))
            });
        axios
            .get(`/api/pos?limit=20000000`)
            .then((res: any) => {
                setPos(res.data.pos.map((p: PosProps) => ({ label: p.nama_pos, value: p.id })))
            });
        axios
            .get(`/api/getGroupsTransaction`)
            .then((res: any) => {
                console.log(res);
                setGroups(res.data.groups.map((group: any) => ({ text: group.description, value: group.description })))
            });
    }, [reload, filter]);


    return {filter,categories,groups,transactions,isAngsuran,setFilter,pos,setIsAngsuran}
}
