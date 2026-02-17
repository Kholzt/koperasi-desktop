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
import TargetForm from './forms/TargetForm';
import SirkulasiForm from './forms/SirkulasiForm';
import IPForm from './forms/IPForm';
import PDForm from './forms/PDForm ';
import SUForm from './forms/SUForm';
import NaikTurunForm from './forms/NaikTurunForm';


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

    const {
        items: modalTarget, sum: modalTargetSum,
        pagination: paginationTarget, fetchPage: fetchTarget
    } = usePosisiUsaha(posisiUsahaCode.TARGET);
    const {
        items: modalSirkulasi, sum: modalSirkulasiSum,
        pagination: paginationSirkulasi, fetchPage: fetchSirkulasi
    } = usePosisiUsaha(posisiUsahaCode.SIRKULASI);
    const {
        items: modalIp, sum: modalIpSum,
        pagination: paginationIp, fetchPage: fetchIp
    } = usePosisiUsaha(posisiUsahaCode.IP);

    const {
        items: modalPD, sum: modalPDSum,
        pagination: paginationPD, fetchPage: fetchPD
    } = usePosisiUsaha(posisiUsahaCode.PD);

    const {
        items: modalSU, sum: modalSUSum,
        pagination: paginationSU, fetchPage: fetchSU
    } = usePosisiUsaha(posisiUsahaCode.SU);

    const {
        items: modalNaikTurun, sum: modalNaikTurunSum,
        pagination: paginationNaikTurun, fetchPage: fetchNaikTurun
    } = usePosisiUsaha(posisiUsahaCode.NAIK_TURUN);




    const loadAllData = useCallback((sDate: string | null, eDate: string | null) => {
        const start = sDate || '';
        const end = eDate || '';
        fetchAngsuran(1, paginationAngsuran.limit, start, end);
        fetchModalDo(1, paginationModalDo.limit, start, end);
        fetchTargetAnggota(1, paginationTargetAnggota.limit, start, end);
        fetchTarget(1, paginationTarget.limit, start, end);
        fetchIp(1, paginationIp.limit, start, end);
        fetchPD(1, paginationPD.limit, start, end);
        fetchSU(1, paginationSU.limit, start, end);
        fetchNaikTurun(1, paginationNaikTurun.limit, start, end);
        fetchSirkulasi(1, paginationSirkulasi.limit, start, end);
    }, [fetchAngsuran, fetchModalDo, fetchTargetAnggota, fetchTarget, fetchIp, fetchPD, fetchSU, fetchNaikTurun, fetchSirkulasi, paginationAngsuran.limit, paginationModalDo.limit, paginationTargetAnggota.limit, paginationTarget.limit, paginationIp.limit, paginationPD.limit, paginationSU.limit, paginationNaikTurun.limit, paginationSirkulasi.limit]);

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
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("storting")} Icon={DollarLineIcon} title='Storting' count={angsuranSum} />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("modaldo")} Icon={DollarLineIcon} title='Modal DO' count={modalDoSum} />
                <MetricItem
                    hasPointer
                    onClick={() => setModalActive("ip")}
                    Icon={DollarLineIcon}
                    title='IP'
                    count={`${(modalIpSum / (paginationIp.total || 1)).toFixed(2)}%`}
                    valueClassName={(modalIpSum / (paginationIp.total || 1)) >= 100 ? "text-gray-800 dark:text-white/90" : "text-red-500"}
                />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("target")} Icon={DollarLineIcon} title='Target' count={modalTargetSum} />
                <MetricItem hasPointer onClick={() => setModalActive("targetanggota")} Icon={DollarLineIcon} title='Target Anggota' count={modalTargetAnggotaSum} />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("sirkulasi")} Icon={DollarLineIcon} title='Sirkulasi' count={modalSirkulasiSum} />
                <MetricItem
                    isCurrency
                    hasPointer
                    onClick={() => setModalActive("naikturun")}
                    Icon={DollarLineIcon}
                    title='Naik/Turun'
                    count={modalNaikTurunSum}
                    valueClassName={modalNaikTurunSum >= 0 ? "text-gray-800 dark:text-white/90" : "text-red-500"}
                />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("pd")} Icon={DollarLineIcon} title='PD' count={modalPDSum} />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("su")} Icon={DollarLineIcon} title='SU' count={modalSUSum} />
            </div >

    {/* MODAL */ }
    < Modals
isCurrency
title = "History Angsuran"
titleHeader = "Jumlah Angsuran"
isOpen = { modalActive === "storting"}
setOpen = {(status) => setModalActive(status ? "storting" : null)}
items = { angsuranHistory }
pagination = { paginationAngsuran }
titleHeader2 = "Kelompok"
useGroupName = { true}
onPageChange = {(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
onFilter = {(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
groups = { groups }
hasGroup
    />

            <Modals
                isCurrency
                title="History Modal DO"
                titleHeader="Jumlah Modal Do"
                isOpen={modalActive === "modaldo"}
                setOpen={(status) => setModalActive(status ? "modaldo" : null)}
                items={modalDoHistory}
                pagination={paginationModalDo}
                titleHeader2="Kelompok"
                useGroupName={true}
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
                titleHeader2="Kelompok"
                useGroupName={true}
                pagination={paginationTargetAnggota}
                onPageChange={(filter) => fetchTargetAnggota(filter.page, paginationTargetAnggota.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchTargetAnggota(filter.page, paginationTargetAnggota.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
                Form={TargetAnggotaForm}
            />
            <Modals
                isCurrency
                title="History Target "
                titleHeader="Jumlah Target "
                isOpen={modalActive === "target"}
                setOpen={(status) => setModalActive(status ? "target" : null)}
                items={modalTarget}
                titleHeader2="Kelompok"
                useGroupName={true}
                pagination={paginationTarget}
                onPageChange={(filter) => fetchTarget(filter.page, paginationTarget.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchTarget(filter.page, paginationTarget.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
                Form={TargetForm}
            />
            <Modals
                title="History Sirkulasi"
                titleHeader="Jumlah Sirkulasi"
                titleHeader2="Kelompok"
                useGroupName={true}
                isOpen={modalActive === "sirkulasi"}
                setOpen={(status) => setModalActive(status ? "sirkulasi" : null)}
                items={modalSirkulasi}
                isCurrency={true}
                pagination={paginationSirkulasi}
                onPageChange={(filter) => fetchSirkulasi(filter.page, paginationSirkulasi.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchSirkulasi(filter.page, paginationSirkulasi.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
                Form={SirkulasiForm}
            />
            <Modals
                title="History IP"
                titleHeader="Jumlah IP"
                isOpen={modalActive === "ip"}
                setOpen={(status) => setModalActive(status ? "ip" : null)}
                items={modalIp}
                pagination={paginationIp}
                onPageChange={(filter) => fetchIp(filter.page, paginationIp.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchIp(filter.page, paginationIp.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
                Form={IPForm}
                isPercentage={true}
            />
            <Modals
                title="History Naik/Turun"
                titleHeader="Jumlah Naik/Turun"
                isOpen={modalActive === "naikturun"}
                setOpen={(status) => setModalActive(status ? "naikturun" : null)}
                items={modalNaikTurun}
                pagination={paginationNaikTurun}
                onPageChange={(filter) => fetchNaikTurun(filter.page, paginationNaikTurun.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchNaikTurun(filter.page, paginationNaikTurun.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
                Form={NaikTurunForm}
                isCurrency={true}
                addButtonText="Generate Naik/Turun"
            />
            <Modals
                isCurrency
                title="History PD"
                titleHeader="Jumlah PD"
                isOpen={modalActive === "pd"}
                setOpen={(status) => setModalActive(status ? "pd" : null)}
                items={modalPD}
                pagination={paginationPD}
                onPageChange={(filter) => fetchPD(filter.page, paginationPD.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchPD(filter.page, paginationPD.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
                Form={PDForm}
            />
            <Modals
                isCurrency
                title="History SU"
                titleHeader="Jumlah SU"
                isOpen={modalActive === "su"}
                setOpen={(status) => setModalActive(status ? "su" : null)}
                items={modalSU}
                pagination={paginationSU}
                onPageChange={(filter) => fetchSU(filter.page, paginationSU.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                onFilter={(filter) => fetchSU(filter.page, paginationSU.limit, filter.startDate || '', filter.endDate || '', filter.group || "")}
                groups={groups}
                hasGroup
                Form={SUForm}
            />
        </>
    );
};

export default Metrics;
