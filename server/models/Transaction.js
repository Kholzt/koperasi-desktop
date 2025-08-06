import db from "../config/db";

export default class Transaction {
    static async findAll({ startDate, endDate = null, transaction_type = null, category = null, group = null }) {
        const query = db('transactions')
            .join('categories', 'transactions.category_id', 'categories.id')
            .join('users as ucb', 'transactions.created_by', 'ucb.id')
            .leftJoin('users as uub', 'transactions.updated_by', 'uub.id')
            .join("pos", "transactions.pos_id", "pos.id")
            .whereNull('transactions.deleted_at');

        if (transaction_type) query.andWhere('transaction_type', transaction_type);
        if (category) query.andWhere('category_id', category);
        if (group) query.andWhere('category_id', group);
        if (startDate && endDate && startDate !== "null" && endDate !== "null") {
            query.andWhereRaw(
                `transactions.created_at BETWEEN  '${startDate}' AND '${endDate}'`
            );
        } else if (startDate && startDate !== "null") {
            query.andWhereRaw(
                `transactions.created_at >= '${startDate}'`

            );
        } else if (endDate && endDate !== "null") {
            query.andWhereRaw(
                `transactions.created_at <= ${endDate}`
            );
        }


        let transactions = await query
            .orderBy('transactions.id', 'desc')
            .select(
                'transactions.*',
                db.raw(`JSON_OBJECT('complete_name', ucb.complete_name, 'nik', ucb.nik) as created_by`),
                db.raw(`JSON_OBJECT('complete_name', uub.complete_name, 'nik', uub.nik) as created_by`),
                db.raw(`JSON_OBJECT('nama_pos', pos.nama_pos) as pos`)
            );


        return { transactions };
    }



    static async findById(id) {
        return await db('pinjaman')
            .join('members', 'pinjaman.anggota_id', 'members.id')
            // .join('users as pj', 'pinjaman.penanggung_jawab', 'pj.id')
            .join('users as pit', 'pinjaman.petugas_input', 'pit.id')
            .leftJoin('angsuran', 'pinjaman.id', 'angsuran.id_pinjaman')
            .leftJoin('penagih_angsuran ', 'penagih_angsuran.id_angsuran', 'angsuran.id')
            .leftJoin('users', 'penagih_angsuran.id_karyawan', 'users.id')
            .leftJoin("pos", "members.pos_id", "pos.id")
            .whereNull('pinjaman.deleted_at')
            .andWhere('pinjaman.id', id)
            .orderBy('angsuran.tanggal_pembayaran', "asc")
            .select(
                'pinjaman.*',
                db.raw("DATE_SUB(tanggal_angsuran_pertama, INTERVAL 7 DAY) AS tanggal_peminjaman"),
                'members.complete_name as anggota_nama',
                // 'pj.complete_name as pj_nama',
                'pit.complete_name as pit_nama',
                'angsuran.id as id_angsuran',
                'angsuran.jumlah_bayar',
                'angsuran.jumlah_katrol',
                'angsuran.tanggal_pembayaran',
                'angsuran.status as status_angsuran',
                'angsuran.asal_pembayaran',
                "users.complete_name as penagih_nama",
                "nama_pos"
            )
    }

    static async findByIdOnlyOne(id) {
        return await db('pinjaman').where("id", id).first();
    }
    static async findPenanggungJawab(penanggung_jawab) {
        return await db('users').whereIn("id", JSON.parse(penanggung_jawab));
    }
    static async createAngsuran({ idPinjaman, tanggalPembayaran, status }) {
        return await db("angsuran").insert({ jumlah_bayar: 0, id_pinjaman: idPinjaman, asal_pembayaran: null, status, tanggal_pembayaran: tanggalPembayaran });
    }
    static async existLoan(anggota_id, kode, excludeId) {
        const member = await db("members").where("id", anggota_id).first();
        const loan = db("pinjaman").where("kode", kode)
            .join("members", "pinjaman.anggota_id", "members.id")
            .where("members.area_id", member.area_id)
            .whereNull("pinjaman.deleted_at")
        if (excludeId) loan.andWhereNot("pinjaman.id", excludeId)
        return await loan.first();
    }


    static async create(data) {
        const [id] = await db('pinjaman').insert(data)

        return id;
    }
    static async update(data, id) {
        const result = await db('pinjaman')
            .where({ id })
            .update(data);
        return result;
    }

    static async softDelete(id) {
        return db('pinjaman').where({ id }).update({ deleted_at: new Date() });
    }

    static async checkStatusPinjamanAnggota(id) {
        const [{ total }] = await db("pinjaman").where("anggota_id", id).whereNot("status", "lunas").whereNull('pinjaman.deleted_at').count({ total: '*' })
        return total;
    }

    static async checkStatusAngsuran(id) {
        const [{ total }] = await db("angsuran").where("id_pinjaman", id).whereNot("jumlah_bayar", 0).count({ total: '*' })
        return total;
    }
    static async findByTanggal(id, tanggal) {
        const [{ total }] = await db("angsuran").where("id_pinjaman", id).where("tanggal_pembayaran", tanggal).count({ total: '*' })
        return total > 0;
    }


    static async updateSisaPembayaran(idPinjaman) {
        const pinjaman = await db("pinjaman").where("id", idPinjaman).first();
        const [sumResult] = await db("angsuran")
            .where("id_pinjaman", idPinjaman)
            .sum({ total_katrol: "jumlah_katrol" })
            .sum({ total_bayar: "jumlah_bayar" });

        const totalAngsuran = (Number(sumResult.total_katrol) || 0) + (Number(sumResult.total_bayar) || 0);
        const sisaPembayaran = Number(pinjaman.total_pinjaman) - totalAngsuran;
        console.log(sisaPembayaran, totalAngsuran);
        return await db("pinjaman").where("id", idPinjaman).update({
            sisa_pembayaran: sisaPembayaran <= 0 ? 0 : sisaPembayaran,
        });
    }

}
