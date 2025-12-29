import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from "../../components/form/date-picker";
import {
    DollarLineIcon
} from "../../icons";
import { posisiUsahaCode } from '../../utils/constanta';
import { toLocalDate } from '../../utils/helpers';
import { MetricItem } from './MetricItem';
import Modals from './Modals';
import { usePosisiUsaha } from './hooks/usePosisiUsaha';
const Metrics: React.FC = () => {

    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [modalActive, setModalActive] = useState<string | null>(null);
    const [angsuranHistoryOpen, setAngsuranHistoryOpen] = useState<boolean>(false);
    const [modalDoHistoryOpen, setModalDoHistoryOpen] = useState<boolean>(false);

    // --- Hooks Data ---
    const {
        items: angsuranHistory, sum: angsuranSum,
        pagination: paginationAngsuran, fetchPage: fetchAngsuran
    } = usePosisiUsaha(posisiUsahaCode.STORTING);

    const {
        items: modalDoHistory, sum: modalDoSum,
        pagination: paginationModalDo, fetchPage: fetchModalDo
    } = usePosisiUsaha(posisiUsahaCode.MODALDO);

    // --- Handlers (Memoized) ---
    const loadAllData = useCallback((sDate: string | null, eDate: string | null) => {
        const start = sDate || '';
        const end = eDate || '';
        fetchAngsuran(1, paginationAngsuran.limit, start, end);
        fetchModalDo(1, paginationModalDo.limit, start, end);
    }, [fetchAngsuran, fetchModalDo, paginationAngsuran.limit, paginationModalDo.limit]);

    // --- Effects ---
    useEffect(() => {
        loadAllData(startDate, endDate);
        // Dependency hanya pada tanggal, tidak perlu status modal terbuka/tutup
    }, [startDate, endDate, loadAllData, modalActive]);

    const handleDateChange = (date: (Date | null)[]) => {
        setStartDate(date && date[0] ? toLocalDate(date[0]) : null);
        setEndDate(date && date[1] ? toLocalDate(date[1]) : null);
    };
    return (
        <>
            <div className="md:w-[50%] w-full">
                <label htmlFor="" className="mb-2 inline-block">Filter Rentang Tanggal</label>
                <DatePicker
                    hasClear
                    id={"globalFilter"}
                    mode="range"
                    placeholder="Tanggal peminjaman"
                    defaultDate={startDate && endDate ? [new Date(startDate), new Date(endDate)] : undefined}
                    onChange={handleDateChange}
                /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">


                <MetricItem hasPointer onClick={() => setModalActive("storting")} Icon={DollarLineIcon} title='Storting' count={angsuranSum} />
                <MetricItem hasPointer onClick={() => setModalActive("modaldo")} Icon={DollarLineIcon} title='Modal DO' count={modalDoSum} />
                <MetricItem Icon={DollarLineIcon} title='IP' count={0} />
                <MetricItem Icon={DollarLineIcon} title='Target' count={0} />
                <MetricItem Icon={DollarLineIcon} title='Target Anggota' count={0} />
                <MetricItem Icon={DollarLineIcon} title='Sirkulasi' count={0} />
                <MetricItem Icon={DollarLineIcon} title='Naik/Turun' count={0} />
                <MetricItem Icon={DollarLineIcon} title='PD' count={0} />
                <MetricItem Icon={DollarLineIcon} title='SU' count={0} />
            </div>

            <Modals
                title="History Angsuran"
                titleHeader="Jumlah Angsuran"
                isOpen={modalActive == "storting"}
                setOpen={(status) => setModalActive(status ? "storting" : null)}
                items={angsuranHistory}
                pagination={paginationAngsuran}
                onPageChange={(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || '', filter.endDate || '')}
                onFilter={(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || '', filter.endDate || '')}
            />

            <Modals
                title="History Modal DO"
                titleHeader="Jumlah Modal Do"
                isOpen={modalActive == "modaldo"}
                setOpen={(status) => setModalActive(status ? "modaldo" : null)}
                items={modalDoHistory}
                pagination={paginationModalDo}
                onPageChange={(filter) => fetchModalDo(filter.page, paginationModalDo.limit, filter.startDate || '', filter.endDate || '')}
                onFilter={(filter) => fetchModalDo(filter.page, paginationModalDo.limit, filter.startDate || '', filter.endDate || '')}
            />
        </>
    )


}

export default Metrics
