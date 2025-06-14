import db from "../config/db";

export default class Member {
    static async findAll({ offset, limit, search }) {
        const rows = await db('members as m')
            .join('areas as a', 'm.area_id', 'a.id')
            .select(
                'm.id as member_id',
                'm.complete_name',
                'm.address',
                'm.sequence_number',
                'm.area_id',
                'a.id as area_id',
                'a.area_name as area_name'
            )
            .whereNull('m.deleted_at')
            .andWhere('m.complete_name', 'like', `%${search}%`)
            .orderBy('m.id', 'desc')
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
                'm.id as member_id',
                'm.complete_name',
                'm.address',
                'm.area_id',
                'a.id as area_id',
                'a.area_name as area_name'
            )
            .whereNull('m.deleted_at')
            .andWhere('m.id', id)
            .first();
    }
    static async getSequenceNumber(id) {
        return await db("members").orderBy("created_at", "desc").first();
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
            db('pinjaman').where('anggota_id', id).first(),
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
}
