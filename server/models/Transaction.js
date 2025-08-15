import db from "../config/db";

export default class Transaction {
    static async findAll({ startDate, endDate = null, transaction_type = null, categories = null, groups = null, pos }) {
        // 1. Hitung saldo awal
        const saldoQuery = await db('transactions')
            .whereNull('deleted_at')
            .andWhere('date', '<', `${startDate}`)
            .select(
                db.raw(`SUM(CASE WHEN transaction_type = 'debit' THEN amount ELSE 0 END) as total_debit`),
                db.raw(`SUM(CASE WHEN transaction_type = 'kredit' THEN amount ELSE 0 END) as total_kredit`)
            )
            .first();
        const saldoAwal = (saldoQuery.total_debit || 0) - (saldoQuery.total_kredit || 0);

        // 2. Lanjutkan query utama Anda
        const query = db('transactions')
            .join('categories', 'transactions.category_id', 'categories.id')
            .join('users as ucb', 'transactions.created_by', 'ucb.id')
            .leftJoin('users as uub', 'transactions.updated_by', 'uub.id')
            .join("pos", "transactions.pos_id", "pos.id")
            .whereNull('transactions.deleted_at');

        if (transaction_type && transaction_type.length > 0) query.whereIn('transaction_type', transaction_type);
        if (categories && categories.length > 0) query.whereIn('category_id', categories);
        if (groups && groups.length > 0) query.whereIn('description', groups);
        if (pos) query.where('transactions.pos_id', pos);
        if (startDate && endDate && startDate !== "null" && endDate !== "null") {
            query.andWhereRaw(
                `transactions.date BETWEEN  '${startDate}' AND '${endDate}'`
            );
        } else if (startDate && startDate !== "null") {
            query.andWhereRaw(`transactions.date >= '${startDate}'`);
        } else if (endDate && endDate !== "null") {
            query.andWhereRaw(`transactions.date <= '${endDate}'`);
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

    static async findById(id) {
        return await db('transactions')
            .join('categories', 'transactions.category_id', 'categories.id')
            .join('users as ucb', 'transactions.created_by', 'ucb.id')
            .leftJoin('users as uub', 'transactions.updated_by', 'uub.id')
            .join("pos", "transactions.pos_id", "pos.id")
            .whereNull('transactions.deleted_at')
            .select(
                'transactions.*',
                db.raw(`JSON_OBJECT('complete_name', ucb.complete_name ) as created_user`),
                db.raw(`JSON_OBJECT('complete_name', uub.complete_name) as update_user`),
                db.raw(`JSON_OBJECT('name', categories.name) as category`),
                db.raw(`JSON_OBJECT('nama_pos', pos.nama_pos) as pos`)
            ).where("transactions.id", id).first();
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
        const lastRecord = await db("transactions")
            .where("date", ">=", todayStart)
            .first();

        const sequence = lastRecord ? lastRecord.sequence + 1 : 1;
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

    static async softDelete(id) {
        return db('transactions').where({ id }).update({ deleted_at: new Date() });
    }




}
