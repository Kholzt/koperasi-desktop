import db from '../config/db.js';

class Group {
    static async findAll({ page = 1, limit = 10, search = '' }) {
        const offset = (page - 1) * limit;

        const rows = await db('groups as g')
            .select(
                'g.id as group_id',
                'g.group_name',
                'g.area_id',
                'a.area_name',
                'u.id as staff_id',
                'u.complete_name as staff_name'
            )
            .join('areas as a', 'g.area_id', 'a.id')
            .join('group_details as gd', function () {
                this.on('gd.group_id', '=', 'g.id').andOnNull('gd.deleted_at');
            })
            .join('users as u', 'gd.staff_id', 'u.id')
            .whereNull('g.deleted_at')
            .andWhere('g.group_name', 'like', `%${search}%`)
            .orderBy('g.id', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ total }] = await db('groups')
            .count('* as total')
            .whereNull('deleted_at')
            .andWhere('group_name', 'like', `%${search}%`);

        return { rows, total };
    }

    static async findById(id) {
        return await db('groups as g')
            .select(
                'g.id as group_id',
                'g.group_name',
                'g.area_id',
                'a.area_name',
                'u.id as staff_id',
                'u.complete_name as staff_name'
            )
            .join('areas as a', 'g.area_id', 'a.id')
            .join('group_details as gd', function () {
                this.on('gd.group_id', '=', 'g.id').andOnNull('gd.deleted_at');
            })
            .join('users as u', 'gd.staff_id', 'u.id')
            .where("g.id", id)
            .whereNull('g.deleted_at')
            ;
    }


    static async create({ group_name, area_id }) {
        const [id] = await db('groups').insert({ group_name, area_id });
        return id;
    }

    static async insertStaffs(group_id, staffs) {
        const inserts = staffs.map((staff_id) => ({
            group_id,
            staff_id,
        }));
        await db('group_details').insert(inserts);
    }

    static async update({ id, group_name, area_id }) {
        return db('groups').where({ id }).update({ group_name, area_id });
    }

    static async deleteGroupDetails(group_id) {
        return db('group_details').where({ group_id }).del();
    }

    static async softDelete(id) {
        return db('groups').where({ id }).update({ deleted_at: new Date() });
    }

    static async checkContraint(id) {
        const checks = [
            db('schedule').where('group_id', id).whereNull('deleted_at').first(),
        ];

        const [members, groups, schedule] = await Promise.all(checks);
        return members || groups || schedule;
    }

    static async count() {
        const [{ total }] = await db('groups')
            .count('* as total')
            .whereNull('deleted_at');
        return total;
    }

    static async existsByName(name, excludeId = null) {
        const query = db('groups')
            .where({ group_name: name })
            .whereNull('deleted_at');
        if (excludeId) query.andWhereNot({ id: excludeId });
        const result = await query.first();
        return !!result;
    }
}

export default Group; // instansiasi tunggal
