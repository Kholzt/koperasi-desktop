import React, { useEffect, useState } from 'react'
import DatePicker from "../../components/form/date-picker";
import { toLocalDate } from '../../utils/helpers';

interface ModalFilterProps {
    onFilter: (filter: any) => void,
    groups?: any[]
}
export default function ModalFilter({ onFilter, groups }: ModalFilterProps) {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [group, setGroup] = useState<string | number | null>(null);
    useEffect(() => {
        if (startDate || endDate || group) {
            onFilter({ startDate, endDate, group })
        }
    }, [startDate, endDate, group]);
    return (
        <>
            <div className="md:w-[50%] w-full">
                <label htmlFor="" className="mb-2 inline-block">Filter Rentang Tanggal</label>
                <DatePicker
                    hasClear
                    id={"startDate"}
                    mode="range"
                    placeholder="Tanggal peminjaman"
                    defaultDate={
                        startDate && endDate
                            ? [new Date(startDate as string), new Date(endDate as string)]
                            : (startDate ? [new Date(startDate as string)] : undefined)
                    }
                    onChange={(date) => {
                        date[0]
                            ? setStartDate(toLocalDate(date[0]))
                            : (setStartDate(null));


                        date[1]
                            ? setEndDate(toLocalDate(date[1]))
                            : setEndDate(null);
                    }}
                /></div>
        </>
    )
}
