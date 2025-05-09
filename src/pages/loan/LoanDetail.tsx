import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axios from "../../utils/axios";
import { AngsuranProps, LoanProps } from "../../utils/types";
import { formatCurrency, formatDate, formatLongDate } from "../../utils/helpers";
import { ChevronLeftIcon } from "../../icons";
const LoanDetail: React.FC = () => {
    const { id } = useParams();
    const [loan, setLoan] = useState<LoanProps | null>(null);

    useEffect(() => {
        axios.get(`/api/loans/${id}`).then((res: any) => {
            setLoan(res.data.loan)
            console.log(res);

        });
    }, []);
    console.log(loan);

    return (
        <>
            <PageMeta
                title={`Detail Peminjaman | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle="Detail Peminjaman" />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/loan"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Peminjaman
                </Link>
            </div>
            <div className="space-y-6">
                <ComponentCard title="Detail Peminjaman">
                    <div className="grid grid-cols-4 gap-px border rounded-md overflow-hidden text-sm">
                        <div className="bg-gray-50 p-3  border-b text-gray-700">Kode</div>
                        <div className="bg-white p-3 font-medium border-b">{loan?.kode}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Nama Anggota</div>
                        <div className="bg-white p-3 font-medium border-b">{loan?.anggota?.complete_name}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Jumlah Pinjaman</div>
                        <div className="bg-white p-3 font-medium border-b">{formatCurrency(loan?.jumlah_pinjaman)}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Persen Bunga</div>
                        <div className="bg-white p-3 font-medium border-b">{loan?.persen_bunga}%</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Total Bunga</div>
                        <div className="bg-white p-3 font-medium border-b">{formatCurrency(loan?.total_bunga)}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Total Pinjaman</div>
                        <div className="bg-white p-3 font-medium border-b">{formatCurrency(loan?.total_pinjaman)}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Jumlah Angsuran</div>
                        <div className="bg-white p-3 font-medium border-b">{loan?.jumlah_angsuran}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Tanggal Angsuran Pertama</div>
                        <div className="bg-white p-3 font-medium border-b">{formatDate(loan?.tanggal_angsuran_pertama)}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Modal DO</div>
                        <div className="bg-white p-3 font-medium border-b">{formatCurrency(loan?.modal_do)}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Penanggung Jawab</div>
                        <div className="bg-white p-3 font-medium border-b">{loan?.penanggungJawab?.complete_name}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Petugas Input</div>
                        <div className="bg-white p-3 font-medium border-b">{loan?.petugas?.complete_name}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Sisa Pembayaran</div>
                        <div className="bg-white p-3 font-medium border-b">{formatCurrency(loan?.sisa_pembayaran)}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Besar Tunggakan</div>
                        <div className="bg-white p-3 font-medium border-b">{formatCurrency(loan?.besar_tunggakan)}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Status</div>
                        <div className="bg-white p-3 font-medium border-b capitalize">{loan?.status}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Dibuat Pada</div>
                        <div className="bg-white p-3 font-medium border-b">{formatDate(loan?.created_at)}</div>

                        <div className="bg-gray-50 p-3  border-b text-gray-700">Terakhir Diperbarui</div>
                        <div className="bg-white p-3 font-medium border-b">{formatDate(loan?.updated_at)}</div>
                    </div>

                </ComponentCard>
                <ComponentCard title="Detail Angsuran">
                    <div className="grid grid-cols-2 gap-px border rounded-md overflow-hidden text-sm">
                        <div className="bg-gray-50 p-3  border-b text-gray-700">Jumlah Bayar</div>
                        <div className="bg-gray-50 p-3  border-b text-gray-700">Tanggal Bayar</div>

                        {loan?.angsuran?.map((angsuran: AngsuranProps, index: number) => {
                            return <>
                                <div key={index} className="bg-white p-3 font-medium border-b capitalize">{formatCurrency(angsuran.jumlah_bayar)}</div>
                                <div className="bg-white p-3 font-medium border-b capitalize">{formatLongDate(angsuran.tanggal_pembayaran)}</div>
                            </>;
                        })}



                    </div>

                </ComponentCard>
            </div>
        </>
    );
}

export default LoanDetail;
