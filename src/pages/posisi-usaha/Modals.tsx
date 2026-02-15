import React, { useState } from 'react';
import Button from '../../components/ui/button/Button';
import { Modal } from '../../components/ui/modal';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../components/ui/table';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Action from './Action';
import ModalFilter from './ModalFilter';


interface PaginationProps {
    page: number;
    totalPages: number;
    limit: number;
    total: number;
}

interface ModalsProps {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isOpen: boolean;
    items: any[];
    title: string;
    titleHeader: string;
    pagination?: any; // Ganti dengan tipe PaginationProps Anda
    onPageChange?: (filter: any) => void;
    onFilter: (filter: any) => void;
    groups: any[];
    Form?: React.ElementType;
    hasGroup?: boolean
    isCurrency?: boolean
}

export default function Modals({
    setOpen,
    isOpen,
    items,
    title,
    titleHeader,
    pagination,
    onPageChange,
    onFilter,
    groups,
    Form,
    hasGroup,
    isCurrency
}: ModalsProps) {
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [group, setGroup] = useState<string | number | null>(null);
    const [idEdit, setIdEdit] = useState<number | null>(null);
    const [isOpenForm, setIsOpenForm] = useState(false);
    return <Modal
        showCloseButton
        // isFullscreen
        className="max-w-[800px] max-h-[90vh] p-6 lg:p-10"
        onClose={() => setOpen(!isOpen)} isOpen={isOpen}>
        <h1 className='text-xl'>{title}</h1>
        <div className="grid md:grid-cols-3 grid-cols-1 gap-4">
            <ModalFilter onFilter={(filter) => {
                onFilter({ ...filter, page: pagination.page })
                setStartDate(filter.startDate)
                setEndDate(filter.endDate)
                setGroup(filter.group)
            }} groups={groups} hasGroup={hasGroup} />
            {Form && <div className='ms-auto'><Button className='mt-8 ' onClick={() => {
                setIsOpenForm(true)
                setIdEdit(null)
            }}>Tambah</Button></div>}
        </div>
        <div className=" h-[60vh] overflow-auto mt-5">
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
                            {titleHeader}
                        </TableCell>
                        <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Tanggal
                        </TableCell>
                        {Form && <TableCell
                            isHeader
                            className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                        >
                            Aksi
                        </TableCell>}


                    </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {items.map((item: any, index: number) => (
                        <TableRow key={index}>
                            <TableCell className="px-5 py-4 sm:px-6 text-start">
                                <div className="flex items-center gap-3">
                                    <div>
                                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                            {pagination ? (pagination.page - 1) * pagination.limit + index + 1 : index + 1}

                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                {isCurrency ? formatCurrency(item.jumlah) : item.jumlah ?? "-"}
                            </TableCell>
                            <TableCell className="px-4 py-3 text-gray-800 font-medium text-start text-theme-sm dark:text-gray-400">
                                {formatDate(item.tanggal)}
                            </TableCell>
                            {Form && <Action setIdEdit={(id: number) => {
                                setIdEdit(id)
                                setIsOpenForm(true)
                            }} id={item.id} code='s' />}
                        </TableRow>
                    ))}

                    {items.length === 0 && <TableRow>
                        <TableCell colSpan={Form ? 4 : 3} className="px-4 py-3 text-gray-700 font-medium  text-theme-sm dark:text-gray-400 text-center">
                            Tidak ada data
                        </TableCell></TableRow>}
                </TableBody>
            </Table>
        </div>
        {pagination && typeof onPageChange === 'function' && (
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Halaman {pagination.page} dari {pagination.totalPages} — {pagination.total} items
                </div>
                <div className="flex gap-2">
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => onPageChange({ page: Math.max(1, pagination.page - 1), startDate, endDate, group })}
                        className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => onPageChange({ page: Math.min(pagination.totalPages, pagination.page + 1), startDate, endDate, group })}
                        className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        )}

        {Form && <Modal isOpen={isOpenForm} onClose={() => setIsOpenForm(!isOpenForm)}
            className="max-w-[800px] max-h-[90vh] p-6 lg:p-10"
        >
            <Form id={idEdit} onClose={() => {
                setIsOpenForm(false)
                onFilter((prev: any) => prev)
                setIdEdit(null)
            }} groups={groups} />
        </Modal>}
    </Modal>;
}
