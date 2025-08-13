import db from '../config/db.js';

class CategoryModel {
    static async findAll({ page = 1, limit = 10, search = '' }) {
        const offset = (page - 1) * limit;

        const rows = await db('categories as c')
            .select(
                'c.*',
                // 'u.complete_name'
            )
            .whereNull('c.deleted_at')
            .andWhere('c.name', 'like', `%${search}%`)
            .orderBy('c.id', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ total }] = await db('categories')
            .count('* as total')
            .whereNull('deleted_at')
            .andWhere('name', 'like', `%${search}%`);

        return { rows, total };
    }

    static async findById(id) {
        return await db('categories as c')
            .select(
                'c.*',
                // 'u.complete_name'
            )
            // .join('users as u', 'c.penanggung_jawab', 'u.id')
            .where("c.id", id)
            .whereNull('c.deleted_at')
            ;
    }


    static async create(data) {
        const [id] = await db('categories').insert(data);
        return id;
    }


    static async update(id, data) {
        return db('categories').where({ id }).update(data);
    }


    static async softDelete(id) {
        return db('categories').where({ id }).update({ deleted_at: new Date() });
    }
    static async generateCode() {
        const last = await db('categories')
            .whereNull("deleted_at")
            .orderBy("id", "desc")
            .first();
        let newNumber = 1;
        if (last?.code) {
            const match = last.code.match(/KTG-(\d+)/);
            if (match) {
                newNumber = parseInt(match[1], 10) + 1;
            }
        }
        const newCode = "KTG" + newNumber;
        return newCode;
    }


    static async checkContraint(id) {
        const checks = [
            db('transactions').where('pos_id', id).whereNull('deleted_at').first(),
        ];

        const [transactions] = await Promise.all(checks);
        return transactions;
    }

    static async count() {
        const [{ total }] = await db('categories')
            .count('* as total')
            .whereNull('deleted_at');
        return total;
    }

    static async existsByName(name, excludeId = null) {
        const query = db('categories')
            .where({ name: name })
            .whereNull('deleted_at');
        if (excludeId) query.andWhereNot({ id: excludeId });
        const result = await query.first();
        return !!result;
    }
}

export default CategoryModel; // instansiasi tunggal
