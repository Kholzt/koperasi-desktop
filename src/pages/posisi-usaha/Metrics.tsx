import React, { SVGProps, useEffect, useState } from 'react';
import {
    GroupIcon,
    LocationIcon
} from "../../icons";
import axios from '../../utils/axios';
import { formatCurrency, formatDate, toLocalDate } from '../../utils/helpers';
import { Modal } from '../../components/ui/modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
const Metrics: React.FC = () => {

    const [angsuranHistory, setAngsuranHistory] = useState<any[]>([]);
    const [angsuranSum, setAngsuranSum] = useState(0);
    const [angsuranHistoryOpen, setAngsuranHistoryOpen] = useState<boolean>(false);
    const [areaCount, setAreaCount] = useState(0);
    const [groupCount, setGroupCount] = useState(0);
    useEffect(() => {
        axios("/api/posisi-usaha-angsuran").then(data => {
            setAngsuranHistory(data.data.angsuran)
            setAngsuranSum(data.data.angsuran_hari_ini)
        });
        axios("/api/areas/count").then(data => setAreaCount(data.data.total));
        axios("/api/groups/count").then(data => setGroupCount(data.data.total));
    }, []);
    return (
        <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">


                <MetricItem onClick={() => setAngsuranHistoryOpen(!angsuranHistoryOpen)} Icon={GroupIcon} title='Storting' count={angsuranSum} />
                <MetricItem Icon={GroupIcon} title='Modal DO' count={0} />
                <MetricItem Icon={LocationIcon} title='IP' count={0} />
                <MetricItem Icon={LocationIcon} title='Target' count={0} />
                <MetricItem Icon={LocationIcon} title='Target Anggota' count={0} />
                <MetricItem Icon={LocationIcon} title='Sirkulasi' count={0} />
                <MetricItem Icon={LocationIcon} title='Naik/Turun' count={0} />
                <MetricItem Icon={LocationIcon} title='PD' count={0} />
                <MetricItem Icon={LocationIcon} title='SU' count={0} />
            </div>
            <Modal
                showCloseButton
                // isFullscreen
                className="max-w-[800px] max-h-[70vh] p-6 lg:p-10"
                onClose={() => setAngsuranHistoryOpen(!angsuranHistoryOpen)} isOpen={angsuranHistoryOpen}>
                <div className=" h-[55vh] overflow-auto mt-10">
                    <Table className='relative'>
                        {/* Table Header */}
                        <TableHeader className="border-b sticky top-0 bg-white dark:bg-gray-900 border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    No
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Jumlah Angsuran
                                </TableCell>
                                <TableCell
                                    isHeader
                                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                                >
                                    Tanggal
                                </TableCell>


                            </TableRow>
                        </TableHeader>

                        {/* Table Body */}
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {angsuranHistory.map((user: any, index: number) => (
                                <TableRow key={index}>
                                    <TableCell className="px-5 py-4 sm:px-6 text-start">
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                    {(index + 1)}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                        {formatCurrency(user.jumlah_angsuran) ?? "-"}
                                    </TableCell>
                                    <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                        {formatDate(user.tanggal_pembayaran)}
                                    </TableCell>

                                </TableRow>
                            ))}

                            {angsuranHistory.length === 0 && <TableRow >
                                <TableCell colSpan={3} className="px-4 py-3 text-gray-700 font-medium  text-theme-sm dark:text-gray-400 text-center">
                                    Tidak ada data
                                </TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </div>
            </Modal></>
    )

    function MetricItem({ title, count, Icon, onClick }: { title: string, count: number, Icon: React.FC<SVGProps<SVGSVGElement>>, onClick?: () => void }) {
        return <div onClick={onClick} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
                <Icon className="text-gray-800 size-6 dark:text-white/90" />
            </div>

            <div className="flex items-end justify-between mt-5">
                <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {title}
                    </span>
                    <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                        {count}
                    </h4>
                </div>
                {/* <Badge color="success">
                    <ArrowUpIcon />
                    11.01%
                </Badge> */}
            </div>
        </div>;
    }
}

export default Metrics
