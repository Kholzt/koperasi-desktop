// models/AreaModel.js
import db from '../config/db.js';

class AreaModel {
    static async findAll({ search = "", limit = 10, offset = 0, status = "aktif" }) {
        const areasQuery = db('areas')
            .select('areas.*', "nama_pos")
            .whereNull('areas.deleted_at')
            .andWhere('area_name', 'like', `%${search}%`)
            .leftJoin("pos", "areas.pos_id", "pos.id")
            .orderBy('id', 'desc')
            .limit(limit)
            .offset(offset);
        if (status != "all") areasQuery.where("status", status);
        return areasQuery;
    }

    static async getTotal(search = "", status = "aktif") {
        const areasQuery = db('areas')
            .whereNull('areas.deleted_at')
            .where("status", "aktif")
            .count('id as total')
            .andWhere('area_name', 'like', `%${search}%`);
        if (status != "all") areasQuery.where("status", status);
        const result = await areasQuery;
        return result[0].total;
    }

    static async findById(id) {
        return db('areas')
            .select('areas.*', "nama_pos")
            .leftJoin("pos", "areas.pos_id", "pos.id")
            .where("areas.id", id)
            ;
    }

    static async existsByName(area_name) {
        return db('areas')
            .where({ area_name })
            .first();
    }

    static async existsByNameExceptId(area_name, id) {
        return db('areas')
            .where('area_name', area_name)
            .andWhereNot('id', id)
            .first();
    }

    static async create(data) {
        const [id] = await db('areas').insert(data);
        return this.findById(id);
    }

    static async update(id, data) {
        return db('areas').where({ id }).update(data);
    }

    static async softDelete(id) {
        return db('areas').where({ id }).update({ deleted_at: new Date() });
    }

    static async checkContraint(id) {
        const checks = [
            db('members').where('area_id', id).whereNull('deleted_at').first(),
            db('groups').where('area_id', id).whereNull('deleted_at').first(),
            db('schedule').where('area_id', id).whereNull('deleted_at').first()
        ];

        const [members, groups, schedule] = await Promise.all(checks);
        return members || groups || schedule;
    }

    static async count() {
        const result = await db('areas').count('id as total').whereNull('deleted_at');
        return result[0].total;
    }
}

export default AreaModel;
