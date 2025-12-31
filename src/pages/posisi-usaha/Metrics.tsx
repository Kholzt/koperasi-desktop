import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from "../../components/form/date-picker";
import {
    DollarLineIcon
} from "../../icons";
import { posisiUsahaCode } from '../../utils/constanta';
import { toLocalDate } from '../../utils/helpers';
import { MetricItem } from './MetricItem';
import Modals from './Modals';
import TargetAnggotaForm from './forms/TargetAnggotaForm';
import { usePosisiUsaha, usePosisiUsahaGroup } from './hooks/usePosisiUsaha';

const Metrics: React.FC = () => {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [modalActive, setModalActive] = useState<string | null>(null);

    // --- Hooks Data ---
    const { groups } = usePosisiUsahaGroup()
    const {
        items: angsuranHistory, sum: angsuranSum,
        pagination: paginationAngsuran, fetchPage: fetchAngsuran
    } = usePosisiUsaha(posisiUsahaCode.STORTING);

    const {
        items: modalDoHistory, sum: modalDoSum,
        pagination: paginationModalDo, fetchPage: fetchModalDo
    } = usePosisiUsaha(posisiUsahaCode.MODALDO);

    const {
        items: modalTargetAnggota, sum: modalTargetAnggotaSum,
        pagination: paginationTargetAnggota, fetchPage: fetchTargetAnggota
    } = usePosisiUsaha(posisiUsahaCode.TARGET_ANGGOTA);
    // --- Handlers (Memoized) ---
    const loadAllData = useCallback((sDate: string | null, eDate: string | null) => {
        const start = sDate || '';
        const end = eDate || '';
        fetchAngsuran(1, paginationAngsuran.limit, start, end);
        fetchModalDo(1, paginationModalDo.limit, start, end);
        fetchTargetAnggota(1, paginationTargetAnggota.limit, start, end);
    }, [fetchAngsuran, fetchModalDo, fetchTargetAnggota, paginationAngsuran.limit, paginationModalDo.limit, paginationTargetAnggota.limit]);

    // --- Effects ---
    useEffect(() => {
        loadAllData(startDate, endDate);
    }, [startDate, endDate, loadAllData]);

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
                />
            </div>

            {/* CARD */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                <MetricItem hasPointer onClick={() => setModalActive("storting")} Icon={DollarLineIcon} title='Storting' count={angsuranSum} />
                <MetricItem hasPointer onClick={() => setModalActive("modaldo")} Icon={DollarLineIcon} title='Modal DO' count={modalDoSum} />
                <MetricItem Icon={DollarLineIcon} title='IP' count={0} />
                <MetricItem Icon={DollarLineIcon} title='Target' count={0} />
                <MetricItem hasPointer onClick={() => setModalActive("targetanggota")} Icon={DollarLineIcon} title='Target Anggota' count={modalTargetAnggotaSum} />
                <MetricItem Icon={DollarLineIcon} title='Sirkulasi' count={0} />
                <MetricItem Icon={DollarLineIcon} title='Naik/Turun' count={0} />
                <MetricItem Icon={DollarLineIcon} title='PD' count={0} />
                <MetricItem Icon={DollarLineIcon} title='SU' count={0} />
            </div>

            {/* MODAL */}
            <Modals
                title="History Angsuran"
                titleHeader="Jumlah Angsuran"
                isOpen={modalActive === "storting"}
                setOpen={(status) => setModalActive(status ? "storting" : null)}
                items={angsuranHistory}
                pagination={paginationAngsuran}
                onPageChange={(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
            />

            <Modals
                title="History Modal DO"
                titleHeader="Jumlah Modal Do"
                isOpen={modalActive === "modaldo"}
                setOpen={(status) => setModalActive(status ? "modaldo" : null)}
                items={modalDoHistory}
                pagination={paginationModalDo}
                onPageChange={(filter) => fetchModalDo(filter.page, paginationModalDo.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchModalDo(filter.page, paginationModalDo.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
            />

            <Modals
                title="History Target Anggota"
                titleHeader="Jumlah Target Anggota"
                isOpen={modalActive === "targetanggota"}
                setOpen={(status) => setModalActive(status ? "targetanggota" : null)}
                items={modalTargetAnggota}
                pagination={paginationTargetAnggota}
                onPageChange={(filter) => fetchTargetAnggota(filter.page, paginationTargetAnggota.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchTargetAnggota(filter.page, paginationTargetAnggota.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
                Form={TargetAnggotaForm}
            />
        </>
    );
};

export default Metrics;
