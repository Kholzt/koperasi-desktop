import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from "../../components/form/date-picker";
import {
    ArrowDownIcon,
    ArrowUpIcon,
    DollarLineIcon
} from "../../icons";
import { posisiUsahaCode } from '../../utils/constanta';
import { toLocalDate } from '../../utils/helpers';
import { MetricItem } from './MetricItem';
import Modals from './Modals';
import TargetAnggotaForm from './forms/TargetAnggotaForm';
import { usePosisiUsaha, usePosisiUsahaGroup, usePosisiUsahaPos, usePosisiUsahaSirkulasi } from './hooks/usePosisiUsaha';
import TargetForm from './forms/TargetForm';
import SirkulasiForm from './forms/SirkulasiForm';
import IPForm from './forms/IPForm';
import PDForm from './forms/PDForm ';
import SUForm from './forms/SUForm';
import NaikTurunForm from './forms/NaikTurunForm';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Label from '../../components/form/Label';
import Select from '../../components/form/Select';


const Metrics: React.FC = () => {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [posId, setPosId] = useState<string | undefined>('');
    const [modalActive, setModalActive] = useState<string | null>(null);

    // --- Hooks Data ---
    const { groups } = usePosisiUsahaGroup()
    const { pos } = usePosisiUsahaPos()
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
        items: modalSirkulasiJalan, sum: modalSirkulasiSumJalan,
        pagination: paginationSirkulasiJalan, fetchPage: fetchSirkulasiJalan
    } = usePosisiUsahaSirkulasi(posisiUsahaCode.SIRKULASI);
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
        items: modalNaikTurun, sum: modalNaikTurunSum, sumPositif, sumNegatif,
        pagination: paginationNaikTurun, fetchPage: fetchNaikTurun
    } = usePosisiUsaha(posisiUsahaCode.NAIK_TURUN);




    const loadAllData = useCallback((sDate: string | null, eDate: string | null) => {
        const start = sDate || '';
        const end = eDate || '';
        fetchAngsuran(1, paginationAngsuran.limit, start, end,'',posId);
        fetchModalDo(1, paginationModalDo.limit, start, end,'',posId);
        fetchTargetAnggota(1, paginationTargetAnggota.limit, start, end,'',posId);
        fetchTarget(1, paginationTarget.limit, start, end,'',posId);
        fetchIp(1, paginationIp.limit, start, end,'',posId);
        fetchPD(1, paginationPD.limit, start, end,'',posId);
        fetchSU(1, paginationSU.limit, start, end,'',posId);
        fetchNaikTurun(1, paginationNaikTurun.limit, start, end,'',posId);
        fetchSirkulasi(1, paginationSirkulasi.limit, start, end,'',posId);
        fetchSirkulasiJalan(1, paginationSirkulasiJalan.limit, start, end,'',posId);
        console.log(1, paginationSirkulasiJalan.limit, start, end,'',posId)
    }, [fetchAngsuran, fetchModalDo, fetchTargetAnggota, fetchTarget, fetchIp, fetchPD, fetchSU, fetchNaikTurun, fetchSirkulasi, fetchSirkulasiJalan, paginationAngsuran.limit, paginationModalDo.limit, paginationTargetAnggota.limit, paginationTarget.limit, paginationIp.limit, paginationPD.limit, paginationSU.limit, paginationNaikTurun.limit, paginationSirkulasi.limit, paginationSirkulasiJalan.limit,posId]);

    // --- Effects ---
    useEffect(() => {
        loadAllData(startDate, endDate);
    }, [startDate, endDate,posId, loadAllData]);

    const handleDateChange = (date: (Date | null)[]) => {
        setStartDate(date && date[0] ? toLocalDate(date[0]) : null);
        setEndDate(date && date[1] ? toLocalDate(date[1]) : null);
    };


    return (
        <>
            <PageMeta title={`Posisi Usaha | ${import.meta.env.VITE_APP_NAME}`} description="" />
            <PageBreadcrumb pageTitle="Posisi Usaha" />
            <div className="flex flex-col md:flex-row items-start gap-4 w-full">
            {/* Filter Rentang Tanggal */}
            <div className="w-full md:w-[40%]">
                <Label htmlFor="globalFilter" className="mb-2 block text-sm font-medium">
                Filter Rentang Tanggal
                </Label>
                <DatePicker
                hasClear
                id="globalFilter"
                mode="range"
                placeholder="Tanggal Mulai - Tanggal Selesai"
                defaultDate={startDate && endDate ? [new Date(startDate), new Date(endDate)] : undefined}
                onChange={handleDateChange}
                className="w-full" // Pastikan datepicker mengisi penuh container-nya
                />
            </div>

            {/* Filter Pos */}
            <div className="w-full md:w-[30%]">
                <Label htmlFor="posSelect" className="mb-2 block text-sm font-medium">
                Pos
                </Label>
                <Select
                id="posSelect"
                options={[{ label: "Pilih semua", value: '' }, ...pos]}
                placeholder="Pilih pos"
                onChange={e => setPosId(e.target.value)}
                className="w-full"
                />
            </div>

            {/* Jika ada tombol Reset atau Search, letakkan di sini agar sejajar */}
            </div>

            {/* CARD */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("storting")} Icon={DollarLineIcon} title='Storting' count={angsuranSum}/>
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("modaldo")} Icon={DollarLineIcon} title='Modal DO' count={modalDoSum} />
                <MetricItem
                    hasPointer
                    onClick={() => setModalActive("ip")}
                    Icon={DollarLineIcon}
                    title='IP'
                    count={`${modalTargetSum == 0  ? 0 : (Math.round((angsuranSum / modalTargetSum) * 100))}%`}
                    valueClassName={(modalIpSum / (paginationIp.total || 1)) >= 100 ? "text-gray-800 dark:text-white/90" : "text-red-500"}
                />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("target")} Icon={DollarLineIcon} title='Target' count={modalTargetSum} />
                <MetricItem hasPointer onClick={() => setModalActive("targetanggota")} Icon={DollarLineIcon} title='Target Anggota' count={modalTargetAnggotaSum} />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("sirkulasi")} Icon={DollarLineIcon} title='Sirkulasi' count={modalSirkulasiSum} />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("sirkulasiJalan")} Icon={DollarLineIcon} title='Sirkulasi Jalan' count={modalSirkulasiSumJalan} />
                <MetricItem
                    isCurrency
                    hasPointer
                    onClick={() => setModalActive("naikturun")}
                    Icon={DollarLineIcon}
                    title='Naik/Turun'
                    count={sumNegatif}
                    isDoubleTitle={true}
                    count2={sumPositif}
                    FirstIcon={ArrowUpIcon}
                    SecondIcon={ArrowDownIcon}
                    valueClassName={"text-red-500"}
                    valueClassName2={"text-green-500"}
                />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("pd")} Icon={DollarLineIcon} title='PD' count={modalPDSum} />
                <MetricItem isCurrency hasPointer onClick={() => setModalActive("su")} Icon={DollarLineIcon} title='SU' count={modalSUSum} />
            </div >

            {/* MODAL */}
            < Modals
                isCurrency
                title="History Angsuran"
                titleHeader="Jumlah Angsuran"
                isOpen={modalActive === "storting"}
                setOpen={(status) => setModalActive(status ? "storting" : null)}
                items={angsuranHistory}
                pagination={paginationAngsuran}
                useGroupName={true}
                titleHeader2="Kelompok"
                onPageChange={(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                hasGroup
                canDelete={true}
                canEdit={false}
            />

            <Modals
                isCurrency
                title="History Modal DO"
                titleHeader="Jumlah Modal Do"
                isOpen={modalActive === "modaldo"}
                setOpen={(status) => setModalActive(status ? "modaldo" : null)}
                items={modalDoHistory}
                pagination={paginationModalDo}
                useGroupName={true}
                titleHeader2="Kelompok"
                onPageChange={(filter) => fetchModalDo(filter.page, paginationModalDo.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchModalDo(filter.page, paginationModalDo.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                canDelete={true}
                canEdit={false}
            />

            <Modals
                title="History Target Anggota"
                titleHeader="Jumlah Target Anggota"
                isOpen={modalActive === "targetanggota"}
                setOpen={(status) => setModalActive(status ? "targetanggota" : null)}
                items={modalTargetAnggota}
                useGroupName={true}
                titleHeader2="Kelompok"
                pagination={paginationTargetAnggota}
                onPageChange={(filter) => fetchTargetAnggota(filter.page, paginationTargetAnggota.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchTargetAnggota(filter.page, paginationTargetAnggota.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                hasGroup
                Form={TargetAnggotaForm}
                canDelete={true}
                canEdit={true}
            />
            <Modals
                isCurrency
                title="History Target "
                titleHeader="Jumlah Target "
                isOpen={modalActive === "target"}
                setOpen={(status) => setModalActive(status ? "target" : null)}
                items={modalTarget}
                useGroupName={true}
                titleHeader2="Kelompok"
                pagination={paginationTarget}
                onPageChange={(filter) => fetchTarget(filter.page, paginationTarget.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchTarget(filter.page, paginationTarget.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                hasGroup
                Form={TargetForm}
                canDelete={true}
                canEdit={true}
            />
            <Modals
                title="History Sirkulasi"
                titleHeader="Jumlah Sirkulasi"
                useGroupName={true}
                titleHeader2="Kelompok"
                isOpen={modalActive === "sirkulasi"}
                setOpen={(status) => setModalActive(status ? "sirkulasi" : null)}
                items={modalSirkulasi}
                isCurrency={true}
                pagination={paginationSirkulasi}
                onPageChange={(filter) => fetchSirkulasi(filter.page, paginationSirkulasi.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchSirkulasi(filter.page, paginationSirkulasi.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                hasGroup
                Form={SirkulasiForm}
                canDelete={true}
                canEdit={true}
            />
            <Modals
                title="History IP"
                titleHeader="Jumlah IP"
                isOpen={modalActive === "ip"}
                setOpen={(status) => setModalActive(status ? "ip" : null)}
                items={modalIp}
                useGroupName={true}
                titleHeader2="Kelompok"
                pagination={paginationIp}
                onPageChange={(filter) => fetchIp(filter.page, paginationIp.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchIp(filter.page, paginationIp.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                hasGroup
                Form={IPForm}
                isPercentage={true}
                canDelete={true}
                canEdit={true}
            />
            <Modals
                title="History Naik/Turun"
                titleHeader="Jumlah Naik/Turun"
                isOpen={modalActive === "naikturun"}
                setOpen={(status) => setModalActive(status ? "naikturun" : null)}
                items={modalNaikTurun}
                useGroupName={true}
                titleHeader2="Kelompok"
                pagination={paginationNaikTurun}
                onPageChange={(filter) => fetchNaikTurun(filter.page, paginationNaikTurun.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchNaikTurun(filter.page, paginationNaikTurun.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                hasGroup
                Form={NaikTurunForm}
                isCurrency={true}
                addButtonText="Generate Naik/Turun"
                canDelete={true}
                canEdit={true}
            />
            <Modals
                isCurrency
                title="History PD"
                titleHeader="Jumlah PD"
                isOpen={modalActive === "pd"}
                setOpen={(status) => setModalActive(status ? "pd" : null)}
                items={modalPD}
                useGroupName={true}
                titleHeader2="Kelompok"
                pagination={paginationPD}
                onPageChange={(filter) => fetchPD(filter.page, paginationPD.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchPD(filter.page, paginationPD.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                hasGroup
                Form={PDForm}
                canDelete={true}
                canEdit={true}
            />
            <Modals
                isCurrency
                title="History SU"
                titleHeader="Jumlah SU"
                isOpen={modalActive === "su"}
                setOpen={(status) => setModalActive(status ? "su" : null)}
                items={modalSU}
                useGroupName={true}
                titleHeader2="Kelompok"
                pagination={paginationSU}
                onPageChange={(filter) => fetchSU(filter.page, paginationSU.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                onFilter={(filter) => fetchSU(filter.page, paginationSU.limit, filter.startDate || '', filter.endDate || '', filter.group || "",posId)}
                groups={groups}
                hasGroup
                Form={SUForm}
                canDelete={true}
                canEdit={true}
            />
        </>
    );
};

export default Metrics;
