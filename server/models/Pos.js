import db from '../config/db.js';

class PosModel {
    static async findAll({ page = 1, limit = 10, search = '' }) {
        const offset = (page - 1) * limit;

        const rows = await db('pos as p')
            .select(
                'p.*',
                // 'u.complete_name'
            )

            // .join('users as u', 'p.penanggung_jawab', 'u.id')
            .whereNull('p.deleted_at')
            .andWhere('p.nama_pos', 'like', `%${search}%`)
            .orderBy('p.id', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ total }] = await db('pos')
            .count('* as total')
            .whereNull('deleted_at')
            .andWhere('nama_pos', 'like', `%${search}%`);

        return { rows, total };
    }

    static async findById(id) {
        return await db('pos as p')
            .select(
                'p.*',
                // 'u.complete_name'
            )
            // .join('users as u', 'p.penanggung_jawab', 'u.id')
            .where("p.id", id)
            .whereNull('p.deleted_at')
            ;
    }


    static async create(data) {
        const [id] = await db('pos').insert(data);
        return id;
    }


    static async update(id, data) {
        return db('pos').where({ id }).update(data);
    }


    static async softDelete(id) {
        return db('pos').where({ id }).update({ deleted_at: new Date() });
    }

    static async checkContraint(id) {
        const checks = [
            db('schedule').where('pos_id', id).whereNull('deleted_at').first(),
            db('members').where('pos_id', id).whereNull('deleted_at').first(),
            db('users').where('pos_id', id).whereNull('deleted_at').first(),
            db('areas').where('pos_id', id).whereNull('deleted_at').first(),
            db('groups').where('pos_id', id).whereNull('deleted_at').first(),
        ];

        const [schedule, members, users, areas, groups] = await Promise.all(checks);
        return schedule || members || users || areas || groups;
    }

    static async count() {
        const [{ total }] = await db('pos')
            .count('* as total')
            .whereNull('deleted_at');
        return total;
    }

    static async existsByName(name, excludeId = null) {
        const query = db('pos')
            .where({ nama_pos: name })
            .whereNull('deleted_at');
        if (excludeId) query.andWhereNot({ id: excludeId });
        const result = await query.first();
        return !!result;
    }
}

export default PosModel; // instansiasi tunggal
