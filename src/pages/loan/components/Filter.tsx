import React, { useEffect, useState } from 'react';
import DatePicker from '../../../components/form/date-picker';
import Select from '../../../components/form/Select';
import Button from '../../../components/ui/button/Button';
import Dropdown from '../../../components/ui/dropdown/Dropdown';
import { toLocalDate } from '../../../utils/helpers';

interface FilterProps {
    filter: { startDate: string | null; endDate: string | null; status: string | null };
    setFilter: (f: { startDate: string | null; endDate: string | null; status: string | null }) => void;
}

const Filter: React.FC<FilterProps> = ({ filter, setFilter }) => {
    const [isOpenDropdown, setIsOpenDropdown] = useState(false);
    const [startDate, setStartDate] = useState<string | null>(filter.startDate);
    const [endDate, setEndDate] = useState<string | null>(filter.endDate);
    const [status, setStatus] = useState<string | null>(filter.status);

    useEffect(() => {
        setStartDate(filter.startDate);
        setEndDate(filter.endDate);
        setStatus(filter.status);
    }, [filter.startDate, filter.endDate, filter.status]);

    const openDropdown = () => setIsOpenDropdown(true);
    const closeDropdown = () => setIsOpenDropdown(false);
    const handleFilter = () => {
        setFilter({ startDate, endDate, status });
        closeDropdown();
    };

    return (
        <div className="relative">
            <Button size="sm" variant="outline" onClick={openDropdown} className="flex items-center text-gray-700 dark:text-gray-400 px-4">
                Filter
            </Button>

            <Dropdown isOpen={isOpenDropdown} onClose={closeDropdown} className="absolute right-0 mt-[17px] w-[600px] rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark">
                <div className="flex flex-col gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        <label className="block mb-1 font-medium">Tanggal Peminjaman</label>
                        <DatePicker
                            hasClear
                            id="startDate"
                            mode="range"
                            placeholder="Tanggal peminjaman"
                            defaultDate={startDate && endDate ? [new Date(startDate as string), new Date(endDate as string)] : (startDate ? [new Date(startDate as string)] : undefined)}
                            onChange={(date) => {
                                date[0] ? setStartDate(toLocalDate(date[0])) : setStartDate(null);
                                date[1] ? setEndDate(toLocalDate(date[1])) : setEndDate(null);
                            }}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Status Peminjaman</label>
                        <Select
                            placeholder="Pilih status"
                            options={[{ label: 'Semua', value: '' }, { label: 'Aktif', value: 'aktif' }, { label: 'Menunggak', value: 'menunggak' }, { label: 'Lunas', value: 'lunas' }]}
                            className="w-full rounded-md border px-2 py-1 dark:bg-gray-800 dark:border-gray-700"
                            value={status ?? ''}
                            defaultValue={filter.status ?? ''}
                            onChange={(e: any) => setStatus(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                        <Button size="sm" variant="outline" onClick={closeDropdown}>Batal</Button>
                        <Button size="sm" onClick={handleFilter}>Terapkan</Button>
                    </div>
                </div>
            </Dropdown>
        </div>
    );
};

export default Filter;
