import React, { useEffect, useState } from "react";

import { Link, useParams } from "react-router";
import { toast } from "react-toastify";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { Modal } from "../../components/ui/modal";
import { useTheme } from "../../context/ThemeContext";
import { useUser } from "../../hooks/useUser";
import { ChevronLeftIcon, PencilIcon, TrashBinIcon } from "../../icons";
import axios from "../../utils/axios";
import { formatCurrency, formatDate, formatLongDate } from "../../utils/helpers";
import { AngsuranProps, LoanProps } from "../../utils/types";
import AngsuranModal from './AngsuranModal';
const LoanDetail: React.FC = () => {
    const { id } = useParams();
    const [loan, setLoan] = useState<LoanProps | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [tanggal, setTanggal] = useState('');
    const [jumlahBayar, setJumlahBayar] = useState('');


    const closeModal = () => setIsOpen(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const openModal = (id: number) => {
        setSelectedId(id);
        setIsOpen(true);
    };
    const { setReload, reload } = useTheme();
    const { user } = useUser();
    useEffect(() => {
        axios.get(`/api/loans/${id}`).then((res: any) => {
            setLoan(res.data.loan)

        });
    }, [showModal, reload]);

    const deleteAction = async () => {
        try {
            await axios.put("/api/delete-angsuran/" + selectedId);


            toast.success("Angsuran berhasil dihapus")
            setReload(!reload);
            closeModal();
        } catch (error: any) {
            if (error.status == 409) {
                toast.error("Angsuran gagal dihapus, Data pengguna digunakan di bagian lain sistem");
                setReload(!reload);
                closeModal();
                // if (error.response.data.errors) {
                // }
            }
        }
    }

    return (
        <>
            <PageMeta
                title={`Detail Peminjaman | ${import.meta.env.VITE_APP_NAME}`}
                description=""

            />
            <PageBreadcrumb pageTitle="Detail Peminjaman" />
            <div className="w-full   mx-auto mb-2">
                <Link
                    to="/loan?isFromTransaction=true"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Kembali ke Peminjaman
                </Link>
            </div>
            <div className="space-y-6">
                <ComponentCard title="Detail Peminjaman">
                    <div className="grid grid-cols-4 gap-px border rounded-md overflow-hidden text-sm  bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Pos</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{loan?.pos.nama_pos ?? "-"}</div>
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Kode</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{loan?.kode}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Nama Anggota</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{loan?.anggota?.complete_name}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Jumlah Pinjaman</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatCurrency(loan?.jumlah_pinjaman)}</div>



                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Total Bunga</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatCurrency(loan?.total_bunga)}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Total Pinjaman</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatCurrency(loan?.total_pinjaman)}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Jumlah Angsuran</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatCurrency(loan?.jumlah_angsuran)}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Sisa Pembayaran</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatCurrency(loan?.sisa_pembayaran)}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Besar Tunggakan</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatCurrency(loan?.besar_tunggakan)}</div>
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Persen Bunga</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{loan?.persen_bunga}%</div>
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Modal DO</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatCurrency(loan?.modal_do)}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Penanggung Jawab</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{loan?.penanggungJawab.map((p) => p.complete_name).join(", ")}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Petugas Input</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{loan?.petugas?.complete_name}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Tanggal Peminjaman</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatDate(loan?.tanggal_peminjaman)}</div>
                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Tanggal Angsuran Pertama</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatDate(loan?.tanggal_angsuran_pertama)}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Status</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white capitalize">{loan?.status}</div>


                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Dibuat Pada</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatDate(loan?.created_at)}</div>

                        <div className="bg-gray-50 dark:bg-white/[0.03] dark:text-white p-3  divide-y divide-gray-100 dark:divide-white/[0.05] text-gray-700">Terakhir Diperbarui</div>
                        <div className=" p-3 font-medium divide-y divide-gray-100 dark:divide-white/[0.05] dark:text-white">{formatDate(loan?.updated_at)}</div>
                    </div>

                </ComponentCard>
                <ComponentCard title="Detail Angsuran" option={
                    loan?.status != "lunas" && user?.role != "staff" && <Button type="button" onClick={() => setShowModal(true)}>Tambah angsuran</Button>
                }>
                    <table className="min-w-full text-sm border rounded-md overflow-hidden bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                        <thead className=" text-gray-700">
                            <tr>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Jumlah Bayar</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Jumlah Katrol</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Penagih</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Keterangan</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Tanggal Bayar</th>
                                <th className=" text-gray-700   text-theme-sm dark:text-gray-400 p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-left">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {(loan?.angsuran?.length ?? 0) > 0 ? (
                                loan?.angsuran?.map((angsuran: AngsuranProps, index: number) => {
                                    const canEdit = (angsuran.status != "menunggak" && angsuran.status != "Libur Operasional" && angsuran.status != "libur" && angsuran.status != "aktif") && user?.role != "staff";

                                    return <tr key={index} className={getRowClass(angsuran)}>

                                        <td className="p-3  font-medium text-gray-700   text-theme-sm dark:text-white">{formatCurrency(angsuran.jumlah_bayar)}</td>
                                        <td className="p-3  font-medium text-gray-700   text-theme-sm dark:text-white">{formatCurrency(angsuran.jumlah_katrol)}</td>
                                        <td className=" text-gray-700   text-theme-sm dark:text-white p-3  capitalize">{angsuran?.penagih.length > 0 ? angsuran?.penagih?.map((p: any) => {
                                            return p.complete_name;
                                        }).join(",") : "-"}</td>
                                        <td className=" text-gray-700   text-theme-sm dark:text-white p-3  capitalize">{angsuran.status ?? "-"}</td>
                                        <td className=" text-gray-700   text-theme-sm dark:text-white p-3  capitalize">
                                            {angsuran.tanggal_pembayaran ? formatLongDate(angsuran.tanggal_pembayaran) : "-"}
                                        </td>
                                        <td className=" text-gray-700 text-theme-sm dark:text-white p-3  capitalize">
                                            <div className="flex items-center gap-2">
                                                {canEdit && <Link to={`/loan/${loan.id}/angsuran/${angsuran.id}`}><PencilIcon fontSize={20} /></Link>}
                                                {canEdit && <button
                                                    type="button"
                                                    onClick={() => {
                                                        openModal(angsuran?.id);
                                                        setJumlahBayar(formatCurrency(angsuran.jumlah_bayar));
                                                        setTanggal(formatLongDate(angsuran.tanggal_pembayaran));
                                                    }}
                                                    className="inline-flex"
                                                >
                                                    <TrashBinIcon fontSize={20} />
                                                </button>}
                                            </div>
                                        </td>
                                    </tr>
                                })
                            ) : (
                                <tr>
                                    <td colSpan={4} className="p-3 divide-y divide-gray-100 dark:divide-white/[0.05] text-center">
                                        Tidak ada angsuran
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </ComponentCard>



                <Modal isOpen={showModal}
                    onClose={() => setShowModal(false)} className="max-w-[800px] p-6 lg:p-10">
                    <AngsuranModal onClose={() => setShowModal(false)} />
                </Modal>
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
                                Apakah Anda yakin untuk menghapus Angsuran dengan tanggal {tanggal} dan jumlah bayar  {jumlahBayar}?
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
        </>
    );
}

export default LoanDetail;


function getRowClass(angsuran) {
    if (angsuran.status === "lunas" || angsuran.status === "lebih") {
        return "bg-blue-500 text-white";
    } else if (angsuran.status === "menunggak" || (angsuran.asal_pembayaran === "katrol" && angsuran.status === "kurang")) {
        return "bg-red-500";
    } else if (angsuran.status === "libur" || angsuran.status == "Libur Operasional" || angsuran.status == "Libur Operasional") {
        return "bg-yellow-500";
    } else {
        return "";
    }
}

function CustomBadge({ children }: { children: React.ReactNode }) {
    return <span className="inline-flex items-center px-2.5 py-0.5 justify-center gap-1 rounded-full font-medium">{children}</span>
}
