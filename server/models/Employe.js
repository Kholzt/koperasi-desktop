import db from '../config/db.js'; // konfigurasi knex kamu

class Employe {
    static tableName = 'users';

    static async findAll({ page = 1, limit = 10, search = '', access_apps = 'noAccess' }) {
        const offset = (page - 1) * limit;

        const employees = await db(this.tableName)
            .whereNull('deleted_at')
            .andWhere('complete_name', 'like', `%${search}%`)
            .andWhere('access_apps', access_apps)
            .orderBy('id', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ total }] = await db(this.tableName)
            .whereNull('deleted_at')
            .andWhere('complete_name', 'like', `%${search}%`)
            .andWhere('access_apps', access_apps)
            .count({ total: '*' });

        return { employees, total: Number(total) };
    }

    static async count() {
        const [{ total }] = await db(this.tableName)
            .whereNull('deleted_at')
            .count({ total: '*' });
        return Number(total);
    }

    static async findById(id) {
        const user = await db(this.tableName)
            .where({ id })
            .first();
        return user;
    }

    static async create({ complete_name, role = 'staff', access_apps = 'noAccess', position, status }) {
        const [id] = await db(this.tableName).insert({
            complete_name,
            role,
            access_apps,
            position,
            status
        });
        return this.findById(id);
    }

    static async update(id, data) {
        await db(this.tableName)
            .where({ id })
            .update(data);
    }

    static async softDelete(id) {
        await db(this.tableName)
            .where({ id })
            .update({ deleted_at: new Date() });
    }

    static async checkConstraints(id) {
        const sqlContraintCheck = [
            db('users')
                .join('group_details', 'users.id', 'group_details.staff_id')
                .join('groups', 'group_id', 'groups.id')
                .where('access_apps', 'noAccess').andWhere('users.id', id).whereNull('groups.deleted_at'),
            db('users').join('pinjaman', 'users.id', 'pinjaman.penanggung_jawab')
                .where('access_apps', 'noAccess').andWhere('users.id', id).whereNull('pinjaman.deleted_at'),
        ];

        for (const query of sqlContraintCheck) {
            const data = await query;
            if (data.length > 0) {
                return false;
            }
        }
        return true;
    }
}

export default Employe;
