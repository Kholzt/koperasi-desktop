import React, { useEffect, useState, useRef } from 'react'
import DatePicker from "../../components/form/date-picker";
import { toLocalDate } from '../../utils/helpers';
import Select from '../../components/form/Select';

interface ModalFilterProps {
    onFilter: (filter: any) => void,
    groups: { label: string, value: string }[],
    hasGroup?: boolean
}

export default function ModalFilter({ onFilter, groups, hasGroup }: ModalFilterProps) {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [group, setGroup] = useState<string | number | null>(null);

    return (
        <>
            <div className="">
                <label className="mb-2 inline-block">Filter Rentang Tanggal</label>
                <DatePicker
                    hasClear
                    id={"startDate"}
                    mode="range"
                    placeholder="Tanggal Transaksi"
                    defaultDate={
                        startDate && endDate
                            ? [new Date(startDate), new Date(endDate)]
                            : (startDate ? [new Date(startDate)] : undefined)
                    }
                    onChange={(date) => {
                        const s = date[0] ? toLocalDate(date[0]) : null;
                        const e = date[1] ? toLocalDate(date[1]) : null;
                        setStartDate(s);
                        setEndDate(e);
                        onFilter({ startDate: s, endDate: e, group });
                    }}
                />
            </div>
            {hasGroup && <div>
                <label className="mb-2 inline-block">Kelompok</label>
                <Select
                    options={[{ label: "Pilih semua", value: '' }, ...groups]}
                    placeholder="Pilih kelompok"
                    onChange={e => {
                        setGroup(e.target.value)
                        onFilter({ startDate, endDate, group: e.target.value });
                    }}
                />
            </div>}

        </>
    )
}
