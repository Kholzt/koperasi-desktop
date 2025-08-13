import React, { useRef, useState } from "react";
import { toast } from 'react-toastify';
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
import { useUser } from "../../hooks/useUser";
import { PencilIcon, TrashBinIcon } from "../../icons";
import axios from "../../utils/axios";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { TransactionProps } from "../../utils/types";

// import { toast } from 'react-hot-toast';
interface TransactionTableProps {
    data: TransactionProps[],
    tableRef: React.RefObject<HTMLTableElement>;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ data, tableRef }) => {
    const debit = data
        .filter(t => t.transaction_type === "debit" && t.category.name != "Kas")
        .reduce((sum, t) => sum + t.amount, 0);

    // Hitung total credit
    const credit = data
        .filter(t => t.transaction_type === "credit")
        .reduce((sum, t) => sum + t.amount, 0);

    // Selisih debit dan credit
    const total = debit - credit;


    const { user: userLogin } = useUser();

    return (
        <div className=" rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">

            <div className="max-w-full ">
                <Table className="border-0">
                    {/* Table Header */}
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                rowSpan={2}
                                isHeader
                                className="px-5 py-3 border-gray-100 dark:border-white/[0.05] border-e  font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tanggal
                            </TableCell>

                            <TableCell
                                rowSpan={2}

                                isHeader
                                className="px-5 py-3 border-gray-100 dark:border-white/[0.05] border-e  font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Kategori
                            </TableCell>
                            <TableCell
                                rowSpan={2}
                                isHeader
                                className="px-5 py-3 border-gray-100 dark:border-white/[0.05] border-e  font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Keterangan
                            </TableCell>
                            <TableCell colSpan="2"
                                isHeader
                                className="px-5 py-3 border-gray-100  dark:border-white/[0.05] border-e border-b text-center  font-medium text-gray-500  text-theme-xs dark:text-gray-400"
                            >
                                Jenis Transaksi
                            </TableCell>
                            {(userLogin?.role == "pusat" || userLogin?.role == "super admin" || userLogin?.role == "controller") && <><TableCell
                                rowSpan={2}
                                isHeader
                                className="px-5 py-3 border-gray-100  dark:border-white/[0.05] border-e border-b text-center  font-medium text-gray-500  text-theme-xs dark:text-gray-400"
                            >
                                Dibuat oleh
                            </TableCell>
                                <TableCell
                                    rowSpan={2}
                                    isHeader
                                    className="px-5 py-3 border-gray-100  dark:border-white/[0.05] border-e border-b text-center  font-medium text-gray-500  text-theme-xs dark:text-gray-400"
                                >
                                    Diubah oleh
                                </TableCell></>}

                            {(userLogin?.role == "pusat" || userLogin?.role == "super admin") && <TableCell
                                rowSpan={2}
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Aksi
                            </TableCell>}
                        </TableRow>
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 border-gray-100 dark:border-white/[0.05] border-e  font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Debit
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 border-gray-100 dark:border-white/[0.05] border-e  font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Kredit
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {data.map((user: TransactionProps, index: number) => (
                            <TableRow key={index}>

                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">

                                        {formatDate(user.date) ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {user.category?.name}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">

                                        {user.description ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm text-green-500 capitalize">

                                        {user.transaction_type == "debit" ? formatCurrency(user.amount) : "Rp. 0"}

                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm text-red-500 capitalize">

                                        {user.transaction_type == "credit" ? formatCurrency(user.amount) : "Rp. 0"}
                                    </span>
                                </TableCell>
                                {(userLogin?.role == "pusat" || userLogin?.role == "super admin" || userLogin?.role == "controller") && <><TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm  capitalize">

                                        {user.created_user?.complete_name ?? "-"}
                                    </span>
                                </TableCell>
                                    <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                        <span className="block   text-theme-sm  capitalize">
                                            {user.updated_user?.complete_name ?? "-"}
                                        </span>
                                    </TableCell></>}


                                {(userLogin?.role == "pusat" || userLogin?.role == "super admin") && index != 0 && <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-500 text-start text-theme-sm dark:text-gray-400 capitalize">
                                    <Action id={user.id} code={user.code} />
                                </TableCell>}

                            </TableRow>
                        ))}
                        {data.length === 0 && <TableRow >
                            <TableCell colSpan={6} className="px-4 py-3 text-gray-700 font-medium  text-theme-sm dark:text-gray-400 text-center">
                                Tidak ada data
                            </TableCell></TableRow>}
                    </TableBody>
                    <tfoot className="dark:bg-[#1e2636] bg-white sticky bottom-0">
                        <TableRow >
                            <TableCell colSpan={6} className="px-4 py-3 text-gray-700 font-medium  text-theme-sm dark:text-white text-end border-gray-100 border-t border-e dark:border-white/[0.05]">
                            </TableCell>
                        </TableRow>

                        <TableRow className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            <TableCell colSpan={3} className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-end border-gray-100 border-t border-e dark:border-white/[0.05]">
                                Subtotal
                            </TableCell>
                            <TableCell className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-start border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {formatCurrency(debit)}
                            </TableCell>
                            <TableCell className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-start border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {formatCurrency(credit)}
                            </TableCell>
                            <TableCell className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-center border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {" "}
                            </TableCell>
                        </TableRow>

                        <TableRow className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            <TableCell colSpan={3} className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-end border-gray-100 border-t border-e dark:border-white/[0.05]">
                                Total
                            </TableCell>

                            <TableCell colSpan={2} className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-center border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {formatCurrency(total)}
                            </TableCell>
                            <TableCell className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-center border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {" "}
                            </TableCell>

                        </TableRow>
                    </tfoot>
                </Table>
            </div>
        </div >
    );
};




function Action({ id, code }: { id: number, code: string }) {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const openDropdown = () => setIsOpenDropdown(true);
    const closeDropdown = () => setIsOpenDropdown(false);
    const { isOpen, openModal, closeModal } = useModal();
    const { setReload, reload } = useTheme();
    const { user } = useUser();
    const deleteAction = async () => {
        try {
            let res = await axios.delete("/api/transactions/" + id);
            toast.success("Transaksi berhasil dihapus")
            setReload(!reload);
            closeModal();
        } catch (error: any) {
            if (error.status == 409) {
                toast.error("Transaksis gagal dihapus, Data pengguna digunakan di bagian lain sistem");
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
                        to={`/transactions/${id}/edit`}
                        className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                    >
                        <PencilIcon fontSize={20} />
                        Edit
                    </DropdownItem>}
                </li>
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
                        Apakah Anda yakin untuk menghapus transaksi dengan kode {code}?
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
export default TransactionTable;
