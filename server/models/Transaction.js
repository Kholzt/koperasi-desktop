import db from "../config/db";
import { formatDateLocal } from "../helpers/helpers";

export default class Transaction {
    static async findAll({ startDate, endDate = null, transaction_type = null, categories = null, groups = null, pos = null, isPusatAdmin = false }) {

        const lastDate = await db('transactions')
            .whereNull('deleted_at')
            .andWhere('date', '<', startDate)
            .orderBy('date', 'desc')
            .select('date')
            .first();
        const lastDateOnly = lastDate?.date?.toISOString()?.slice(0, 10) ?? "1100-10-01";

        // 1. Hitung saldo awal
        const saldoQuery = await db('transactions')
            .whereNull('deleted_at')
            .andWhereRaw(`DATE(date) = '${lastDateOnly}'`)
            .select(
                db.raw(`SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_debit`),
                db.raw(`SUM(CASE WHEN transaction_type = 'credit' THEN amount ELSE 0 END) as total_kredit`)
            )
            .first();

        const saldoAwal = (saldoQuery.total_debit || 0) - (saldoQuery.total_kredit || 0);

        // 2. Lanjutkan query utama Anda
        const query = db('transactions')
            .join('categories', 'transactions.category_id', 'categories.id')
            .join('users as ucb', 'transactions.created_by', 'ucb.id')
            .leftJoin('users as uub', 'transactions.updated_by', 'uub.id')
            .join("pos", "transactions.pos_id", "pos.id")
            ;

        if (!isPusatAdmin) query.whereNull('transactions.deleted_at');
        if (transaction_type && transaction_type.length > 0) query.whereIn('transaction_type', transaction_type);
        if (categories && categories.length > 0) query.whereIn('category_id', categories);
        if (groups && groups.length > 0) query.whereIn('description', groups);
        if (pos) query.where('transactions.pos_id', pos);
        if (startDate && endDate && startDate !== "null" && endDate !== "null") {
            query.andWhereRaw(
                `transactions.date BETWEEN  '${startDate}' AND '${endDate}'`
            );
        } else if (startDate && startDate !== "null") {
            query.andWhereRaw(`DATE(transactions.date) = '${startDate}'`);
        } else if (endDate && endDate !== "null") {
            query.andWhereRaw(`DATE(transactions.date) = '${endDate}'`);
        }

        let transactions = await query
            .orderBy('transactions.id', 'asc')
            .select(
                'transactions.*',
                db.raw(`JSON_OBJECT('complete_name', ucb.complete_name ) as created_user`),
                db.raw(`JSON_OBJECT('complete_name', uub.complete_name) as updated_user`),
                db.raw(`JSON_OBJECT('name', categories.name) as category`),
                db.raw(`JSON_OBJECT('nama_pos', pos.nama_pos) as pos`)
            );

        // 3. Tambahkan row saldo awal manual ke awal array
        transactions.unshift({
            description: 'Saldo Awal',
            amount: saldoAwal,
            transaction_type: 'debit', // atau sesuai logika Anda
            category: { name: "Kas" },
            created_user: null,
            update_user: null,
            pos: null,
            date: startDate, // opsional: bisa juga null
        });

        return { transactions };
    }

    static async labaRugi({ startDate = null, endDate = null, transaction_type = null, categories = null, groups = null, pos }) {
        const query = db('transactions')
            // .join('categories', 'transactions.category_id', 'categories.id')
            // .join('users as ucb', 'transactions.created_by', 'ucb.id')
            // .leftJoin('users as uub', 'transactions.updated_by', 'uub.id')
            // .join("pos", "transactions.pos_id", "pos.id")
            .whereNull('transactions.deleted_at');

        // if (transaction_type && transaction_type.length > 0) query.whereIn('transaction_type', transaction_type);
        // if (categories && categories.length > 0) query.whereIn('category_id', categories);
        // if (groups && groups.length > 0) query.whereIn('description', groups);
        // if (pos) query.where('transactions.pos_id', pos);
        if (startDate && endDate && startDate !== "null" && endDate !== "null") {
            query.andWhereRaw(
                `transactions.date BETWEEN  '${startDate} 00:00:00' AND '${endDate} 23:59:59'`
            );
        } else if (startDate && startDate !== "null") {
            query.andWhereRaw(`DATE(transactions.date) = '${startDate}'`);
        } else if (endDate && endDate !== "null") {
            query.andWhereRaw(`DATE(transactions.date) = '${endDate}'`);
        }

        let transactions = await query
            // .groupBy('transactions.category_id', 'transactions.description', 'transactions.pos_id')
            .select(
                db.raw(`
      SUM(CASE WHEN transactions.transaction_type = 'debit' THEN transactions.amount ELSE 0 END) as total_debit,
      SUM(CASE WHEN transactions.transaction_type = 'credit' THEN transactions.amount ELSE 0 END) as total_kredit,
      (
        SUM(CASE WHEN transactions.transaction_type = 'debit' THEN transactions.amount ELSE 0 END) -
        SUM(CASE WHEN transactions.transaction_type = 'credit' THEN transactions.amount ELSE 0 END)
      ) as total
    `)
            )
        // .orderBy(db.raw('MAX(transactions.id)'), 'asc')
        return { transactions };
    }

    static async findById(id) {
        return await db('transactions')
            .join('categories', 'transactions.category_id', 'categories.id')
            .join('users as ucb', 'transactions.created_by', 'ucb.id')
            .leftJoin('users as uub', 'transactions.updated_by', 'uub.id')
            .join("pos", "transactions.pos_id", "pos.id")
            .leftJoin("log_transactions", "transactions.id", "log_transactions.id_transaksi")
            .leftJoin("users as lu", "log_transactions.updated_by", "lu.id")

            .whereNull('transactions.deleted_at')
            .select(
                'transactions.*',
                db.raw(`JSON_OBJECT('complete_name', ucb.complete_name ) as created_user`),
                db.raw(`JSON_OBJECT('complete_name', uub.complete_name) as update_user`),
                db.raw(`JSON_OBJECT('name', categories.name) as category`),
                db.raw(`JSON_OBJECT('nama_pos', pos.nama_pos) as pos`),
                db.raw(`COALESCE(JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', log_transactions.id,
                    'updated_by', lu.complete_name,
                    'status', log_transactions.status,
                    'meta', log_transactions.meta,
                    'reason', log_transactions.reason,
                    'updated_at', log_transactions.updated_at
                )
            ), JSON_ARRAY()) as logs`)
            )
            .where("transactions.id", id)
            .groupBy("transactions.id") // penting untuk agregasi
            .first();
    }


    static async generateCode({ transaction_type, category_id }) {
        // 1. Ambil kategori
        const category = await db("categories")
            .where("id", category_id)
            .first();
        if (!category) throw new Error("Kategori tidak ditemukan");

        // 2. Tentukan kode jenis transaksi
        const type = transaction_type === "debit" ? "DBT" : "KRD";

        // 3. Ambil tanggal sekarang dan format jadi yymmddHHMMss
        const now = new Date();
        const pad = (n) => String(n).padStart(2, "0");
        const datePart =
            pad(now.getFullYear() % 100) + // yy
            pad(now.getMonth() + 1) +      // mm
            pad(now.getDate()) +           // dd
            pad(now.getHours()) +          // HH
            pad(now.getMinutes()) +        // MM
            pad(now.getSeconds());         // ss

        // 4. Ambil sequence terakhir hari ini
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const totalToday = await db("transactions")
            .where("date", ">=", todayStart)
            .where("date", "<", todayEnd)
            .count("id as count")
            .first();

        const sequence = (totalToday?.count || 0) + 1;
        const sequencePart = String(sequence).padStart(2, "0"); // jadi 2 digit

        // 5. Gabung semua bagian
        return `${category.code}${type}${datePart}${sequencePart}`;
    }

    static async getGroupTransaction() {
        return await db("transactions as t")
            .join("categories as p", "t.category_id", "p.id")
            .where("p.name", "angsuran") // hanya ambil yang kategorinya angsuran
            .select("t.description")
            .groupBy("t.description");
    }

    static async create(data) {
        const [id] = await db('transactions').insert(data)

        return id;
    }
    static async update(data, id) {
        const result = await db('transactions')
            .where({ id })
            .update(data);
        return result;
    }
    static async createLog(data) {
        const result = await db('log_transactions')
            .insert(data);
        return result;
    }

    static async softDelete(id) {
        return db('transactions').where({ id }).update({ deleted_at: new Date() });
    }


    static async getTransactionsByInfo({ desc, date, type, category, resource }) {
        // ubah ke format YYYY-MM-DD
        const formattedDate = formatDateLocal(date);

        return await db("transactions as t")
            .where("category_id", category)
            .where("description", desc)
            .whereRaw("DATE(`date`) = '" + formattedDate + "'")
            .where("transaction_type", type)
            .where("resource", resource)
            .first();
    }

    static async decreseTransaksi({ transaction_type, transactionDate, description, amount = 0, resource }) {
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

}
