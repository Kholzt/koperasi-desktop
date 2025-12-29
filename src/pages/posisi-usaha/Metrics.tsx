import React, { useEffect, useState } from 'react';
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

    const { items: angsuranHistory, sum: angsuranSum, pagination: paginationAngsuran, fetchPage: fetchAngsuran } = usePosisiUsaha(posisiUsahaCode.STORTING);
    const { items: modalDoHistory, sum: modalDoSum, pagination: paginationModalDo, fetchPage: fetchModalDo } = usePosisiUsaha(posisiUsahaCode.MODALDO);
    const [areaCount, setAreaCount] = useState(0);
    const [groupCount, setGroupCount] = useState(0);
    const [angsuranHistoryOpen, setAngsuranHistoryOpen] = useState<boolean>(false);
    const [modalDoHistoryOpen, setModalDoHistoryOpen] = useState<boolean>(false);
    useEffect(() => {
        // const modalDoToday = getPosisiUsaha(posisiUsahaCode.MODALDO)
        // initial load
        fetchAngsuran(1, paginationAngsuran.limit, startDate || '', endDate || '');
        fetchModalDo(1, paginationModalDo.limit, startDate || '', endDate || '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startDate, endDate, angsuranHistoryOpen, modalDoHistoryOpen]);
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">


                <MetricItem hasPointer onClick={() => setAngsuranHistoryOpen(!angsuranHistoryOpen)} Icon={DollarLineIcon} title='Storting' count={angsuranSum} />
                <MetricItem hasPointer onClick={() => setModalDoHistoryOpen(!modalDoHistoryOpen)} Icon={DollarLineIcon} title='Modal DO' count={modalDoSum} />
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
                isOpen={angsuranHistoryOpen}
                setOpen={setAngsuranHistoryOpen}
                items={angsuranHistory}
                pagination={paginationAngsuran}
                onPageChange={(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || startDate || '', filter.endDate || endDate || '')}
                onFilter={(filter) => fetchAngsuran(filter.page, paginationAngsuran.limit, filter.startDate || startDate || '', filter.endDate || endDate || '')}
            />

            <Modals
                title="History Modal DO"
                titleHeader="Jumlah Modal Do"
                isOpen={modalDoHistoryOpen}
                setOpen={setModalDoHistoryOpen}
                items={modalDoHistory}
                pagination={paginationModalDo}
                onPageChange={(filter) => fetchModalDo(filter.page, paginationModalDo.limit, filter.startDate || startDate || '', filter.endDate || endDate || '')}
                onFilter={(filter) => fetchModalDo(filter.page, paginationModalDo.limit, filter.startDate || startDate || '', filter.endDate || endDate || '')}
            />
        </>
    )


}

export default Metrics
