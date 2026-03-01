import db from "../config/db";
import Transaction from "../models/Transaction";
const insertToPosisiUsaha = async (data) => {
    return await db("posisi_usaha").insert(data)
}

const decreseTransaksi = async ({ transaction_type, transactionDate, description, amount = 0, resource }) => {
    const existingTransaction = await Transaction.getTransactionsByInfo({
        category: 1,
        date: transactionDate,
        desc: description,
        type: transaction_type,
        resource
    });
    if (existingTransaction) {
        const amountTransaksi = existingTransaction.amount - amount
        await Transaction.update({ amount: amountTransaksi <= 0 ? 0 : amountTransaksi }, existingTransaction.id);
    }
}




const formatDateLocal = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
export {
    insertToPosisiUsaha,
    decreseTransaksi,
    formatDateLocal
}
