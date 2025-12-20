import React from "react";
import { formatCurrency, formatDate } from "../../utils/helpers";
import { TransactionProps } from "../../utils/types";

// import { toast } from 'react-hot-toast';
interface ExportPDFProps {
    data: TransactionProps[],
    tableRef?: React.RefObject<HTMLTableElement>
    | null;
    date: string
}

const ExportPDF: React.FC<ExportPDFProps> = ({ data, tableRef, date }) => {
    const debit = data
        .filter(t => t.transaction_type === "debit" && t.category.name != "Kas" && !t.deleted_at)
        .reduce((sum, t) => sum + t.amount, 0);

    // Hitung total credit
    const credit = data
        .filter(t => t.transaction_type === "credit" && !t.deleted_at)
        .reduce((sum, t) => sum + t.amount, 0);

    const total = debit - credit;

    console.log(data.filter((user: TransactionProps) => !user.deleted_at));
    return (
        <div>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h1 style={{ margin: 0 }}>Laporan Keuangan</h1>
                <p style={{ margin: 0 }}>Tanggal Laporan: {date}</p>
            </div>            <table
                ref={tableRef}
                style={{
                    // display: "none",
                    borderCollapse: "collapse",
                    width: "100%",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "12px",
                }}
            >
                {/* Table Header */}
                <thead>
                    <tr>
                        <th rowSpan={2} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}>
                            Tanggal
                        </th>
                        <th rowSpan={2} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}>
                            Kategori
                        </th>
                        <th rowSpan={2} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}>
                            Keterangan
                        </th>
                        <th colSpan={2} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                            Jenis Transaksi
                        </th>

                    </tr>
                    <tr>
                        <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}>Debit</th>
                        <th style={{ border: "1px solid #ccc", padding: "8px", textAlign: "left" }}>Kredit</th>
                    </tr>
                </thead>

                {/* Table Body */}
                <tbody>
                    {data.filter((user: TransactionProps) => !user.deleted_at).map((user: TransactionProps, index: number) => {
                        return (
                            <tr key={index}>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                    {formatDate(user.date) ?? "-"}
                                </td>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                    {user.category?.name}
                                </td>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                    {user.description ?? "-"}
                                </td>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                    {user.transaction_type === "debit" ? formatCurrency(user.amount) : "Rp. 0"}
                                </td>
                                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                                    {user.transaction_type === "credit" ? formatCurrency(user.amount) : "Rp. 0"}
                                </td>
                            </tr>
                        )
                    })}

                    {data.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                                Tidak ada data
                            </td>
                        </tr>
                    )}
                </tbody>

                {/* Table Footer */}
                <tfoot>
                    <tr>
                        <td colSpan={3} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "right" }}>
                            Subtotal
                        </td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{formatCurrency(debit)}</td>
                        <td style={{ border: "1px solid #ccc", padding: "8px" }}>{formatCurrency(credit)}</td>
                    </tr>
                    <tr>
                        <td colSpan={3} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "right" }}>
                            Total
                        </td>
                        <td colSpan={2} style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                            {formatCurrency(total)}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

    );
};




export default ExportPDF;
