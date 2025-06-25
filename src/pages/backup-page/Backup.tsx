import React, { useEffect, useState } from "react";

import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import axios from "../../utils/axios";


const Backup: React.FC = () => {
    const [backups, setBackups] = useState<any>([]);

    useEffect(() => {
        axios.get("/api/list-backup").then(data => setBackups(data.data.backups))
    }, []);
    const firstItem = backups.length > 0 ? backups[0] : null;

    return (
        <>
            <PageMeta
                title={`Backup | ${import.meta.env.VITE_APP_NAME}`}
                description=""
            />
            <PageBreadcrumb pageTitle="Backup" />

            <div className="space-y-6">
                <ComponentCard title="Backup">
                    {firstItem ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-2 items-center dark:text-white">
                                <span className="font-semibold">Nama File</span>
                                <span className="col-span-3 truncate">{firstItem.name}</span>

                                <span className="font-semibold">Path File</span>
                                <small className="col-span-3 break-all">{firstItem.path}</small>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => window?.electron?.openFile(firstItem.path)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                                >
                                    Buka File
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-center py-4">Belum ada backup ditemukan.</div>
                    )}
                </ComponentCard>


            </div>
        </>
    );
}










export default Backup;
