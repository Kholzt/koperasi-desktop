import db from '../config/db';

class ActivityModel {
    static async findAll({ page = 1, limit = 100, search = '' }) {
        const offset = (page - 1) * limit;

        const rows = await db('log_activity as la')
            .select(
                'la.*',
                'u.username',
                'p.nama_pos as pos_name'
            )

            .join('users as u', 'la.user_id', 'u.id') 
            .join('pos as p', 'la.pos_id', 'p.id') 
            .where('la.description', 'like', `%${search}%`)
            .orderBy('la.id', 'desc')
            .limit(limit)
            .offset(offset);

        const [{ total }] = await db('log_activity')
            .count('* as total')
            .andWhere('description', 'like', `%${search}%`);

        return { rows, total };
    }

    static async findById(id) {
        return await db('log_activity as la')
            .select(
                'la.*',
                'u.complete_name'
            )
            .join('users as u', 'la.user_id', 'u.id')
            .where("la.id", id);
    }

    static async create(data) {
        const [id] = await db('log_activity').insert(data);
        return id;
    }
}

export default ActivityModel;