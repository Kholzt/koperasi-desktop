
import { useState } from 'react';
import { toast } from 'react-toastify';
import Label from '../../components/form/Label';
import { Dropdown } from '../../components/ui/dropdown/Dropdown';
import { DropdownItem } from '../../components/ui/dropdown/DropdownItem';
import { Modal } from '../../components/ui/modal';
import { useUser } from '../../hooks/useUser';
import { PencilIcon, TrashBinIcon } from '../../icons';
import axios from '../../utils/axios';

export default function Action({ id, code, setIdEdit }: { id: number, code: string, setIdEdit: (id: number) => void }) {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [isOpenModal, setIsOpenModal] = useState(false); // Perbaikan: Tambahkan state Modal
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false); // Bagus untuk UX

    const openDropdown = () => setIsOpenDropdown(true);
    const closeDropdown = () => setIsOpenDropdown(false);

    const openModal = () => {
        closeDropdown(); // Tutup dropdown saat modal buka
        setIsOpenModal(true);
    };
    const closeModal = () => setIsOpenModal(false);

    const { user } = useUser(); // Pastikan hook ini tersedia

    const deleteAction = async () => {
        setLoading(true);
        try {
            // Tambahkan data reason jika backend membutuhkannya untuk audit
            await axios.delete(`/api/posisi-usaha/${id}`, { data: { reason } });

            toast.success("Posisi Usaha berhasil dihapus");
            closeModal();

        } catch (error: any) {
            if (error.response?.status === 409) {
                toast.error("Gagal dihapus: Data digunakan di bagian lain sistem");
            } else {
                toast.error(error.response?.data?.message || "Terjadi kesalahan sistem");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={openDropdown}
                className="flex items-center text-gray-700 px-4 hover:text-blue-600"
            >
                <span className="font-bold text-lg">...</span>
            </button>

            <Dropdown
                isOpen={isOpenDropdown}
                onClose={closeDropdown}
                className="absolute right-0 z-10 mt-2 w-52 rounded-2xl border border-gray-200 bg-white p-2 shadow-lg"
            >
                <ul className="flex flex-col gap-1">
                    {user?.role !== "staff" && (
                        <li>
                            <DropdownItem
                                onItemClick={() => setIdEdit(id)}
                                tag="button"
                                className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                <PencilIcon fontSize={20} /> Edit
                            </DropdownItem>
                        </li>
                    )}
                    <li>
                        <DropdownItem
                            onItemClick={openModal} // Memanggil fungsi openModal
                            tag="button"
                            className="flex w-full items-center gap-3 px-3 py-2 font-medium text-red-600 rounded-lg hover:bg-red-50"
                        >
                            <TrashBinIcon fontSize={20} /> Hapus
                        </DropdownItem>
                    </li>
                </ul>
            </Dropdown>

            <Modal
                isOpen={isOpenModal} // Perbaikan: Gunakan state yang benar
                onClose={closeModal}
                className="max-w-[600px] p-6 lg:p-10"
            >
                <div className="flex flex-col normal-case">
                    <h5 className="mb-2 font-semibold text-gray-800 text-xl lg:text-2xl">
                        Pemberitahuan
                    </h5>
                    <p className="text-base text-gray-800 mb-2">
                        Apakah Anda yakin untuk menghapus posisi usaha dengan kode <span className="font-bold">{code}</span>?
                    </p>
                    <p className="text-sm text-gray-500 mb-6 font-italic">
                        * Data yang dihapus dapat dikembalikan nanti (Soft Delete)
                    </p>


                    <div className="flex items-center gap-3 mt-6 justify-end">
                        <button
                            onClick={closeModal}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 border rounded-lg hover:bg-gray-50"
                            disabled={loading}
                        >
                            Tutup
                        </button>
                        <button
                            onClick={deleteAction}
                            className={`px-4 py-2.5 text-sm font-medium text-white rounded-lg transition ${loading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}`}
                            disabled={loading}
                        >
                            {loading ? "Memproses..." : "Ya, Hapus Data"}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
