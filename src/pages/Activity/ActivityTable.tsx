import React, { useState } from "react";
import { toast } from 'react-toastify';
import Badge from "../../components/ui/badge/Badge";
import { Dropdown } from "../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../components/ui/dropdown/DropdownItem";
import { Modal } from "../../components/ui/modal";
import {
    Table, // Ubah nama komponen yang diimpor
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useTheme } from "../../context/ThemeContext";
import { useModal } from "../../hooks/useModal";
import axios from "../../utils/axios";
import { ActivityProps, PaginationProps } from "../../utils/types";
import Pagination from '../../components/tables/BasicTables/Pagination';
import { EyeIcon } from "../../icons";
import { formatLongDate, formatLongDateTime } from "../../utils/helpers";
import { Link } from "react-router";
import Button from "../../components/ui/button/Button";
// import { toast } from 'react-hot-toast';
interface ActivtyTableProps {
    data: ActivityProps[],
    pagination: PaginationProps,
    setPaginate: (page: number) => void
}

const ActivityTable: React.FC<ActivtyTableProps> = ({ data, pagination, setPaginate }) => {
    const { page, totalPages, limit } = pagination;
    const [selectedActivity, setSelectedActivity] = useState<ActivityProps | null>(null);

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

            <div className="max-w-full overflow-x-auto">
                <Table>
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
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
                                Tanggal
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Nama
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Aktivitas
                            </TableCell>

                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Menu
                            </TableCell>
                            {/* <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Posisi
                            </TableCell> */}
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Pos
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Aksi
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {data.map((activityData: ActivityProps, index: number) => (
                            <TableRow key={activityData.id}>
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                                {(index + 1) + ((page - 1) * limit)}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {formatLongDateTime(activityData.created_at) ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {activityData.username ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">

                                    {activityData.description}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {activityData.menu ?? "-"}
                                    </span>
                                </TableCell>


                                <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {activityData.pos_name ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">
                                    <button
                                        onClick={() => setSelectedActivity(activityData)}
                                        className="btn btn-update btn-sm items-center btn-sm justify-center"                                    >
                                        <span className="block  text-theme-sm dark:text-white/90 capitalize">
                                            Detail
                                        </span>
                                    </button>
                                </TableCell>
                            </TableRow>
                        ))}

                        {data.length === 0 && <TableRow >
                            <TableCell colSpan={6} className="px-4 py-3 text-gray-700 font-medium  text-theme-sm dark:text-gray-400 text-center">
                                Tidak ada data
                            </TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPaginate} />
            {/* MODAL DETAIL */}
            {selectedActivity && (
                <Modal
                    isOpen={true}
                    onClose={() => setSelectedActivity(null)}
                    className="max-w-[700px] p-6 lg:p-10"
                >
                    <h3 className="text-lg font-semibold mb-4">Detail Aktivitas</h3>

                    <div className="space-y-2 text-sm">
                        <p><b>Waktu:</b> {formatLongDateTime(selectedActivity.created_at)}</p>
                        <p><b>User:</b> {selectedActivity.username}</p>
                        <p><b>Aksi:</b> {selectedActivity.action}</p>
                        <p><b>Menu:</b> {selectedActivity.menu}</p>
                        <p><b>Pos:</b> {selectedActivity.pos_name ?? "-"}</p>
                        <p><b>Deskripsi:</b> {selectedActivity.description}</p>
                    </div>

                    {selectedActivity.old_data && (
                        <>
                            <hr className="my-4" />
                            <h4 className="font-semibold">Data Lama</h4>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                                {JSON.stringify(selectedActivity.old_data, null, 2)}
                                {/* {JSON.stringify(JSON.parse(selectedActivity.old_data??""), null, 2)} */}
                            </pre>
                        </>
                    )}

                    {selectedActivity.new_data && (
                        <>
                            <hr className="my-4" />
                            <h4 className="font-semibold">Data Baru</h4>
                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                                {/* {JSON.stringify(JSON.parse(selectedActivity.new_data??""), null, 2)} */}
                                {JSON.stringify(selectedActivity.new_data, null, 2)}
                            </pre>
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
};

function Detail({ data }: { data: any }) {
    const { isOpen, openModal, closeModal } = useModal();
    return (
        <Modal isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[600px] p-6 lg:p-10">
            <p>Detail aktivitas dengan ID: {data.id}</p>
        </Modal>
    );
}

export default ActivityTable;
