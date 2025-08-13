import db from "../config/db";

export default class Loan {
    static async findAll({ limit, offset, startDate, endDate, status, day, group, search }) {
        const query = db('pinjaman')
            .join('members', 'pinjaman.anggota_id', 'members.id')
            .leftJoin("pos", "members.pos_id", "pos.id")
            // .leftJoin('group_details', 'pinjaman.penanggung_jawab', 'group_details.staff_id')
            .groupBy("pinjaman.id")
            .whereNull('pinjaman.deleted_at');

        // Filter dengan benar hanya jika nilainya valid
        if (startDate && endDate && startDate !== "null" && endDate !== "null") {
            query.andWhereRaw(
                `DATE_SUB(pinjaman.tanggal_angsuran_pertama, INTERVAL 7 DAY) BETWEEN  '${startDate}' AND '${endDate}'`
            );

        } else if (startDate && startDate !== "null") {
            query.andWhereRaw(
                `DATE_SUB(pinjaman.tanggal_angsuran_pertama, INTERVAL 7 DAY) >= '${startDate}'`

            );
        } else if (endDate && endDate !== "null") {
            query.andWhereRaw(
                `DATE_SUB(pinjaman.tanggal_angsuran_pertama, INTERVAL 7 DAY) <= ${endDate}`
            );
        }


        if (search && search !== "null") {
            query.andWhere(function () {
                this.where('complete_name', 'like', `%${search}%`)
                    .orWhere('nik', 'like', `%${search}%`)
                    .orWhere('no_kk', 'like', `%${search}%`)
            });
        }
        if (status && status !== "null") {
            query.andWhere('pinjaman.status', status);
        }
        if (day && day !== "all") {
            query.andWhereRaw('DAYNAME(pinjaman.tanggal_angsuran_pertama) = "' + day + '"');
        }

        let loans = await query
            .orderBy('pinjaman.id', 'desc')
            .limit(limit)
            .offset(offset)
            .select(
                'pinjaman.*', "complete_name", "nik",
                db.raw("DATE_SUB(tanggal_angsuran_pertama, INTERVAL 7 DAY) AS tanggal_peminjaman"),
                db.raw(`JSON_OBJECT('complete_name', members.complete_name, 'nik', members.nik) as anggota`),
                db.raw(`JSON_OBJECT('nama_pos', pos.nama_pos) as pos`)
            );

        if (group && group !== "all") {
            loans = await Promise.all(loans.map(async loan => {
                try {
                    const staffIds = JSON.parse(loan.penanggung_jawab || '[]');
                    if (!Array.isArray(staffIds) || staffIds.length === 0) return null;

                    const [{ total }] = await db("group_details")
                        .whereIn("staff_id", staffIds)
                        .andWhere("group_id", group)
                        .count({ total: '*' });

                    return total > 0 ? loan : null;
                } catch (err) {
                    return null;
                }
            }));

            // Hapus null hasil dari filter
            loans = loans.filter(Boolean);
        }



        // Buat query baru untuk count

        let countQuery = db('pinjaman')
            .select('pinjaman.*', "complete_name", "nik   ")
            .join('members', 'pinjaman.anggota_id', 'members.id')
            .groupBy("pinjaman.id")
            .whereNull('pinjaman.deleted_at');

        if (startDate && endDate && startDate !== "null" && endDate !== "null") {
            countQuery.andWhereRaw(
                `DATE_SUB(pinjaman.tanggal_angsuran_pertama, INTERVAL 7 DAY) BETWEEN  '${startDate}' AND '${endDate}'`
            );
        } else if (startDate && startDate !== "null") {
            countQuery.andWhereRaw(
                `DATE_SUB(pinjaman.tanggal_angsuran_pertama, INTERVAL 7 DAY) >= '${startDate}'`

            );
        } else if (endDate && endDate !== "null") {
            countQuery.andWhereRaw(
                `DATE_SUB(pinjaman.tanggal_angsuran_pertama, INTERVAL 7 DAY) <= ${endDate}`
            );
        }



        if (search && search !== "null") {
            countQuery.andWhere(function () {
                this.where('complete_name', 'like', `%${search}%`)
                    .orWhere('nik', 'like', `%${search}%`)
            });
        }
        if (status && status !== "null") {
            countQuery.andWhere('pinjaman.status', status);
        }
        if (day && day !== "all") {
            countQuery.andWhereRaw('DAYNAME(pinjaman.tanggal_angsuran_pertama) = "' + day + '"');
        }

        // Ambil semua pinjaman untuk dihitung (tanpa limit & offset)
        let countResults = await countQuery;

        // Jika perlu filter berdasarkan group_id dari JSON staff_id
        if (group && group !== "all") {
            countResults = await Promise.all(countResults.map(async loan => {
                try {
                    const staffIds = JSON.parse(loan.penanggung_jawab || '[]');
                    if (!Array.isArray(staffIds) || staffIds.length === 0) return null;

                    const [{ total }] = await db("group_details")
                        .whereIn("staff_id", staffIds)
                        .andWhere("group_id", group)
                        .count({ total: '*' });

                    return total > 0 ? loan : null;
                } catch (err) {
                    return null;
                }
            }));

            countResults = countResults.filter(Boolean);
        }

        const total = countResults.length;
        return { loans, total };
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
