import React, { useState } from "react";
import { toast } from 'react-toastify';
import Pagination from '../../components/tables/BasicTables/Pagination';
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
import { DollarLineIcon, InfoIcon, PencilIcon, TrashBinIcon } from "../../icons";
import axios from "../../utils/axios";
import { LoanProps, PaginationProps } from "../../utils/types";
import { formatCurrency, formatLongDate } from "../../utils/helpers";
import { useUser } from "../../hooks/useUser";

// import { toast } from 'react-hot-toast';
interface LoanTableProps {
    data: LoanProps[],
    pagination: PaginationProps,
    setPaginate: (page: number) => void
}

const LoanTable: React.FC<LoanTableProps> = ({ data, pagination, setPaginate }) => {
    const { page, totalPages, limit } = pagination;

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
                                Pos
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                NIK
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Kode Pinjaman
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Nama Anggota
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Jumlah Pinjaman
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Sisa Pembayaran
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tunggakan
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Status
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tanggal Peminjaman
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
                        {data.map((user: LoanProps, index: number) => (
                            <TableRow key={user.id}>
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

                                        {user.pos.nama_pos ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {user.anggota.nik}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">

                                        {user.kode ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {user.anggota.complete_name}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {formatCurrency(user.total_pinjaman)}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {formatCurrency(user.sisa_pembayaran)}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {formatCurrency(user.besar_tunggakan)}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">
                                    <Badge
                                        size="sm"
                                        color={user.status === "aktif" ? "success" : "error"}
                                    >
                                        {user.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {formatLongDate(user.tanggal_peminjaman)}
                                    </span>
                                </TableCell>

                                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">
                                    <Action id={user.id} status={user.status} kode={user.kode} completeName={user.anggota.complete_name} />
                                </TableCell>
                            </TableRow>
                        ))}
                        {data.length === 0 && <TableRow >
                            <TableCell colSpan={10} className="px-4 py-3 text-gray-700 font-medium  text-theme-sm dark:text-gray-400 text-center">
                                Tidak ada data
                            </TableCell></TableRow>}
                    </TableBody>
                </Table>
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPaginate} />
        </div>
    );
};




function Action({ id, status, kode, completeName }: { id: number, kode: string, completeName: string, status: string }) {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const openDropdown = () => setIsOpenDropdown(true);
    const closeDropdown = () => setIsOpenDropdown(false);
    const { isOpen, openModal, closeModal } = useModal();
    const { setReload, reload } = useTheme();
    const { user } = useUser();
    const deleteAction = async () => {
        try {
            let res = await axios.delete("/api/loans/" + id);
            toast.success("Pinjaman berhasil dihapus")
            setReload(!reload);
            closeModal();
        } catch (error: any) {
            if (error.status == 409) {
                toast.error("Pinjaman gagal dihapus, Data pengguna digunakan di bagian lain sistem");
                setReload(!reload);
                closeModal();
                // if (error.response.data.errors) {
                // }
            }
        }
    }
    return <div className="">
        <button
            onClick={openDropdown}
            className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400 px-4"
        >
            ...
        </button>
        <Dropdown
            isOpen={isOpenDropdown}
            onClose={closeDropdown}
            className="absolute right-20 mt-[17px] flex w-52 flex-col rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
        >
            <ul className="flex flex-col gap-1  ">
                <li>
                    {user?.role != "staff" && <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        to={`/loan/${id}/edit`}
                        className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                        <PencilIcon fontSize={20} />
                        Edit
                    </DropdownItem>}
                </li>
                <li>
                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        to={`/loan/${id}`}
                        className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                        <InfoIcon fontSize={20} />
                        Detail
                    </DropdownItem>
                </li>
                {status != "lunas" && <li>
                    <DropdownItem
                        onItemClick={closeDropdown}
                        tag="a"
                        to={`/loan/${id}/angsuran`}
                        className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                        <DollarLineIcon fontSize={20} />
                        Tambah Angsuran
                    </DropdownItem>
                </li>}

                <li>
                    <DropdownItem
                        onItemClick={openModal}
                        tag="button"
                        to={`/loan/${id}/edit`}
                        className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                        <TrashBinIcon fontSize={20} />
                        Hapus
                    </DropdownItem>
                </li>

            </ul>
        </Dropdown>

        <Modal
            isOpen={isOpen}
            onClose={closeModal}
            className="max-w-[600px] p-6 lg:p-10"
        >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar normal-case">
                <div>
                    <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                        Pemberitahuan
                    </h5>
                    <p className="text-base text-gray-800 dark:text-gray-400 ">
                        Apakah Anda yakin untuk menghapus pinjaman dengan kode {kode} atas nama {completeName}?
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Data yang dihapus dapat dikembalikan nanti
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
                    <button
                        onClick={closeModal}
                        type="button"
                        className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                    >
                        Tutup
                    </button>
                    <button
                        onClick={deleteAction}
                        type="button"
                        className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 sm:w-auto"
                    >
                        Hapus</button>
                </div>
            </div>
        </Modal>
    </div>
}
export default LoanTable;
