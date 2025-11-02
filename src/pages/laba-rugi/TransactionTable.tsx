import React from "react";
import {
    Table, // Ubah nama komponen yang diimpor
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { useUser } from "../../hooks/useUser";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { TransactionProps } from "../../utils/types";

// import { toast } from 'react-hot-toast';
interface TransactionTableProps {
    data: TransactionProps[],
    tableRef: React.RefObject<HTMLTableElement>;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ data, tableRef }) => {
    const debit = data
        .reduce((sum, t) => sum + t.total_debit, 0);

    // Hitung total credit
    const credit = data
        .reduce((sum, t) => sum + t.total_kredit, 0);

    // Selisih debit dan credit
    const total = debit - credit;


    const { user: userLogin } = useUser();
    const isAdminAndPusat = (userLogin?.role == "pusat" || userLogin?.role == "super admin");
    const isAdminPusatController = (userLogin?.role == "pusat" || userLogin?.role == "super admin" || userLogin?.role == "controller");

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
                                Pos
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
                            <TableCell
                                isHeader
                                className="px-5 py-3 border-gray-100 dark:border-white/[0.05] border-e  font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Total
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    {/* Table Body */}
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {data.map((user: TransactionProps, index: number) => {
                            return <TableRow key={index}>

                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">

                                        {formatDate(user.date) ?? "-"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm dark:text-white/90 capitalize">
                                        {user.pos?.nama_pos ?? "-"}
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

                                        {formatCurrency(user.total_debit) ?? "Rp. 0"}

                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm text-red-500 capitalize">
                                        {formatCurrency(user.total_kredit) ?? "Rp. 0"}
                                    </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 border-e border-t border-gray-100 dark:border-white/[0.05] text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                    <span className="block   text-theme-sm text-green-500 capitalize">
                                        {formatCurrency(user.total) ?? "Rp. 0"}
                                    </span>
                                </TableCell>
                            </TableRow>
                        })}
                        {data.length === 0 && <TableRow >
                            <TableCell colSpan={7} className="px-4 py-3 text-gray-700 font-medium  text-theme-sm dark:text-gray-400 text-center">
                                Tidak ada data
                            </TableCell></TableRow>}
                    </TableBody>



                    <tfoot className="dark:bg-[#1e2636] bg-white sticky bottom-0">
                        <TableRow >
                            <TableCell colSpan={isAdminAndPusat ? 9 : (isAdminPusatController ? 8 : 7)} className="px-4 py-3 text-gray-700 font-medium  text-theme-sm dark:text-white text-end border-gray-100 border-t border-e dark:border-white/[0.05]">
                            </TableCell>
                        </TableRow>

                        <TableRow className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            <TableCell colSpan={4} className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-end border-gray-100 border-t border-e dark:border-white/[0.05]">
                                Subtotal
                            </TableCell>
                            <TableCell className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-start border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {formatCurrency(debit)}
                            </TableCell>
                            <TableCell className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-start border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {formatCurrency(credit)}
                            </TableCell>
                            <TableCell className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-start border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {/* {formatCurrency(credit)} */}
                            </TableCell>

                        </TableRow>

                        <TableRow className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            <TableCell colSpan={4} className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-end border-gray-100 border-t border-e dark:border-white/[0.05]">
                                Total
                            </TableCell>

                            <TableCell colSpan={3} className="font-bold px-4 py-3 text-gray-700   text-theme-sm dark:text-white text-center border-gray-100 border-t border-e dark:border-white/[0.05]">
                                {formatCurrency(total)}
                            </TableCell>


                        </TableRow>
                    </tfoot>
                </Table>
            </div>
        </div >
    );
};

export default TransactionTable;
