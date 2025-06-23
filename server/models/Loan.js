import db from "../config/db";

export default class Loan {
    static async findAll({ limit, offset, startDate, endDate, status, day, group }) {
        const query = db('pinjaman')
            .join('members', 'pinjaman.anggota_id', 'members.id')
            .join('group_details', 'pinjaman.penanggung_jawab', 'group_details.staff_id')
            .groupBy("pinjaman.id")
            .whereNull('pinjaman.deleted_at');

        // Filter dengan benar hanya jika nilainya valid
        if (startDate && startDate !== "null") {
            query.andWhere('pinjaman.created_at', '>=', startDate);
        }

        if (endDate && endDate !== "null") {
            query.andWhere('pinjaman.created_at', '<=', endDate);
        }

        if (status && status !== "null") {
            query.andWhere('pinjaman.status', status);
        }
        if (day && day !== "all") {
            query.andWhereRaw('DAYNAME(pinjaman.tanggal_angsuran_pertama) = "' + day + '"');
        }
        if (group && group !== "all") {
            query.andWhere('group_details.group_id', group);
        }

        const loans = await query
            .orderBy('pinjaman.id', 'desc')
            .limit(limit)
            .offset(offset)
            .select(
                'pinjaman.*',
                db.raw(`JSON_OBJECT('complete_name', members.complete_name, 'nik', members.nik) as anggota`)
            );

        // Buat query baru untuk count
        const countQuery = db('pinjaman').whereNull('deleted_at');

        if (startDate && startDate !== "null") {
            countQuery.andWhere('pinjaman.created_at', '>=', startDate);
        }

        if (endDate && endDate !== "null") {
            countQuery.andWhere('pinjaman.created_at', '<=', endDate);
        }

        if (status && status !== "null") {
            countQuery.andWhere('pinjaman.status', status);
        }

        const [{ total }] = await countQuery.count({ total: '*' });

        return { loans, total };
    }



    static async findById(id) {
        return await db('pinjaman')
            .join('members', 'pinjaman.anggota_id', 'members.id')
            .join('users as pj', 'pinjaman.penanggung_jawab', 'pj.id')
            .join('users as pit', 'pinjaman.petugas_input', 'pit.id')
            .leftJoin('angsuran', 'pinjaman.id', 'angsuran.id_pinjaman')
            .leftJoin('penagih_angsuran ', 'penagih_angsuran.id_angsuran', 'angsuran.id')
            .leftJoin('users', 'penagih_angsuran.id_karyawan', 'users.id')
            .whereNull('pinjaman.deleted_at')
            .andWhere('pinjaman.id', id)
            .orderBy('pinjaman.id')
            .select(
                'pinjaman.*',
                'members.complete_name as anggota_nama',
                'pj.complete_name as pj_nama',
                'pit.complete_name as pit_nama',
                'angsuran.id as id_angsuran',
                'angsuran.jumlah_bayar',
                'angsuran.tanggal_pembayaran',
                'angsuran.status as status_angsuran',
                'angsuran.asal_pembayaran',
                "users.complete_name as penagih_nama",
            )
    }

    static async findByIdOnlyOne(id) {
        return await db('pinjaman').where("id", id).first();
    }
    static async createAngsuran({ idPinjaman, tanggalPembayaran, status }) {
        return await db("angsuran").insert({ jumlah_bayar: 0, id_pinjaman: idPinjaman, asal_pembayaran: null, status, tanggal_pembayaran: tanggalPembayaran });
    }
    static async existLoan(kode, excludeId) {
        const loan = db("pinjaman").where("kode", kode)
        if (excludeId) loan.andWhereNot("id", excludeId)
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

}
