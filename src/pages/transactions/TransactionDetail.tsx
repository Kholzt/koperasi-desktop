import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Modal } from "../../components/ui/modal";
import { useUser } from "../../hooks/useUser";
import { ChevronLeftIcon } from "../../icons";
import axios from "../../utils/axios";
import { LoanProps, TransactionProps } from "../../utils/types";
import { formatCurrency, formatDate } from "../../utils/helpers";
const TransactionDetail: React.FC = () => {
    const { id } = useParams();
    const [transaction, setTransaction] = useState<TransactionProps | null>(null);
    const [showModal, setShowModal] = useState(false);
    useEffect(() => {
        axios.get(`/api/transactions/${id}`).then((res: any) => {
            setTransaction(res.data.transaction)

        });
    }, [showModal]);
    const { user: userLogin } = useUser();

    const isAdminAndPusat = (userLogin?.role == "pusat" || userLogin?.role == "super admin");
    const isAdminPusatController = (userLogin?.role == "pusat" || userLogin?.role == "super admin" || userLogin?.role == "controller");
    return (
        <>
            <PageMeta
                title={`Detail Transaksi | ${import.meta.env.VITE_APP_NAME}`}
                description=""

            />
            <PageBreadcrumb pageTitle="Detail Transaksi" />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/transactions"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Transaksi
                </Link>
            </div>
            <div className="space-y-6">
                <ComponentCard title="Detail Peminjaman">
                    <div className="grid grid-cols-4 gap-px border rounded-md overflow-hidden text-sm bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3 text-gray-700">Tanggal</div>
                        <div className="p-3 font-medium dark:text-white">
                            {formatDate(transaction?.date) ?? "-"}
                        </div>
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3 text-gray-700">Kategori</div>
                        <div className="p-3 font-medium dark:text-white">
                            {transaction?.category.name ?? "-"}
                        </div>
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3 text-gray-700">Keterangan</div>
                        <div className="p-3 font-medium dark:text-white">
                            {transaction?.description ?? "-"}
                        </div>
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3 text-gray-700">Jenis Transaksi</div>
                        <div className="p-3 font-medium dark:text-white">
                            {transaction?.transaction_type ?? "-"}
                        </div>
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3 text-gray-700">Nominal</div>
                        <div className="p-3 font-medium dark:text-white">
                            {formatCurrency(transaction?.amount) ?? "-"}
                        </div>
                        {isAdminPusatController && (
                            <>
                                <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3 text-gray-700">Dibuat oleh</div>
                                <div className="p-3 font-medium dark:text-white">
                                    {transaction?.created_user?.complete_name ?? "-"}
                                </div>
                                <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3 text-gray-700">Diubah oleh</div>
                                <div className="p-3 font-medium dark:text-white">
                                    {transaction?.updated_user?.complete_name ?? "-"}
                                </div>
                            </>
                        )}
                    </div>

                </ComponentCard>
                <ComponentCard title="Log Transaksi" >
                    <table className="min-w-full text-sm border rounded-md overflow-hidden bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <thead className=" text-gray-700">
                            <tr>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Status</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Alasan</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Perubahan</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Diubah oleh</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Tanggal ubah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {transaction?.logs?.map((log: any, i: number) => {
                                console.log(log.meta);
                                return <tr key={i}>
                                    <td className="p-3  font-medium text-gray-700   text-theme-sm dark:text-white">{log.status}</td>
                                    <td className="p-3  font-medium text-gray-700   text-theme-sm dark:text-white">{log.reason}</td>
                                    <td className="p-3 font-medium text-gray-700 text-theme-sm dark:text-white">
                                        <pre className="whitespace-pre-wrap text-xs">
                                            {JSON.stringify(log?.meta, null, 2)}
                                        </pre>
                                    </td>

                                    <td className="p-3  font-medium text-gray-700   text-theme-sm dark:text-white">{log.updated_by}</td>
                                    <td className="p-3  font-medium text-gray-700   text-theme-sm dark:text-white">{formatDate(log.updated_at)}</td>
                                </tr>
                            })}
                            {transaction?.logs.length == 0 && <td colSpan={5}>Tidak ada data</td>}
                        </tbody>
                    </table>
                </ComponentCard>
            </div>
        </>
    );
}

export default TransactionDetail;
