import db from "../config/db";

export default class Member {
    static async findAll({ offset, limit, search }) {
        const rows = await db('members as m')
            .join('areas as a', 'm.area_id', 'a.id')
            .select(
                'm.pos_id',
                'm.description',
                'm.id as member_id',
                'm.complete_name',
                'm.nik',
                'm.no_kk',
                'm.address',
                'm.sequence_number',
                'm.area_id',
                'a.id as area_id',
                'a.area_name as area_name',
                "nama_pos"
            )
            .whereNull('m.deleted_at')
            .andWhere(function () {
                this.where('m.complete_name', 'like', `%${search}%`)
                    .orWhere('m.nik', 'like', `%${search}%`)
            })
            .leftJoin("pos", "m.pos_id", "pos.id")
            .orderBy('m.created_at', 'desc')
            .limit(parseInt(limit))
            .offset(offset);

        // Query total count
        const [{ total }] = await db('members')
            .count('id as total')
            .whereNull('deleted_at')
            .andWhere('complete_name', 'like', `%${search}%`);

        return { total, rows }
    }
    static async findById(id) {
        return await db('members as m')
            .join('areas as a', 'm.area_id', 'a.id')
            .select(
                'm.pos_id',
                'm.description',
                'm.id as member_id',
                "m.sequence_number",
                'm.complete_name',
                'm.nik',
                'm.no_kk',
                'm.address',
                'm.area_id',
                'a.id as area_id',
                'a.area_name as area_name',
                "nama_pos"
            )
            .leftJoin("pos", "m.pos_id", "pos.id")
            .whereNull('m.deleted_at')
            .andWhere('m.id', id)
            .first();
    }
    static async getSequenceNumber(area_id) {
        return await db("members").where("area_id", area_id).whereNull('deleted_at').orderBy("sequence_number", "desc").first();
    }
    static async create(data) {
        const [id] = await db("members").insert(data);
        return id;
    }


    static async update(data, id) {
        return await db("members").where({ id }).update(data);
    }


    static async checkContraint(id) {
        const checks = [
            db('pinjaman').where('anggota_id', id).whereNull('deleted_at').first(),
        ];

        const [members, groups, schedule] = await Promise.all(checks);
        return members || groups || schedule;
    }

    static async softDelete(id) {
        await db("members")
            .where({ id })
            .update({ deleted_at: new Date() });
    }

    static async count() {
        const [{ total }] = await db('members')
            .count('* as total')
            .whereNull('deleted_at');
        return total;
    }
    static async hasPinjaman(id) {
        const [{ total }] = await db('members').join("pinjaman", "members.id", "pinjaman.anggota_id")
            .where("members.id", id)
            .count('* as total')
            .whereNull('pinjaman.deleted_at');
        return total > 0;
    }

    static async nikExist(nik, notNull = false, ignoreId = null) {
        const query = db('members')
            .where("nik", nik)
        if (notNull) {
            query.whereNotNull("deleted_at");
        } else {
            query.whereNull("deleted_at");
        }
        if (ignoreId) {
            query.whereNot("id", ignoreId)
        }
        console.log(ignoreId);
        const [{ total }] = await query.count('* as total');
        return total > 0;
    }
    static async nokkExist(no_kk, notNull = false, ignoreId = null) {
        const query = db('members')
            .where("no_kk", no_kk)
        if (notNull) {
            query.whereNotNull("deleted_at");
        } else {
            query.whereNull("deleted_at");
        }
        if (ignoreId) {
            query.whereNot("id", ignoreId)
        }
        console.log(ignoreId);
        const [{ total }] = await query.count('* as total');
        return total > 0;
    }
    static async findByNik(nik) {
        const query = await db('members')
            .where("nik", nik).first()
        return query;
    }

    static async updateMemberSequenceAndLoanKode(member) {
        const members = await db('members')
            .where("area_id", member.area_id)
            .whereRaw("sequence_number > " + member.sequence_number)

        await Promise.all(
            members.map(async (member) => {
                // Turunkan sequence_number
                await db("members")
                    .where("id", member.id)
                    .decrement("sequence_number", 1);

                // Ambil data pinjaman
                const pinjaman = await db("pinjaman")
                    .where("anggota_id", member.id)
                    .first();

                if (pinjaman) {
                    // Update kode
                    const [prefix, numberStr] = pinjaman.kode.split("/");
                    const newNumber = parseInt(numberStr) - 1;
                    const newKode = `${prefix}/${newNumber}`;

                    await db("pinjaman")
                        .where("anggota_id", member.id)
                        .update({ kode: newKode });
                }
            })
        );



        return true;
    }
}
