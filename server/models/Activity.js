import db from '../config/db';

class ActivityModel {
    static async findAll({
        page = 1,
        limit = 100,
        search = '',
        menu = ''
    }) {
        const offset = (page - 1) * limit;

        const baseQuery = db('log_activity as la')
            .join('users as u', 'la.user_id', 'u.id')
            .leftJoin('pos as p', 'la.pos_id', 'p.id');

        const query = baseQuery.clone()
            .select(
                'la.*',
                'u.username',
                'p.nama_pos as pos_name'
            )
            .orderBy('la.id', 'desc')
            .limit(limit)
            .offset(offset);

        const countQuery = baseQuery.clone()
            .count('* as total');

        // 🔍 SEARCH
        const cleanSearch = search?.trim();
        if (cleanSearch) {
            const applySearch = (qb) => {
                qb.where((q) => {
                    q.where('la.description', 'like', `%${cleanSearch}%`)
                        .orWhere('u.username', 'like', `%${cleanSearch}%`);
                });
            };

            applySearch(query);
            applySearch(countQuery);
        }
        
        // 📂 MENU
        const cleanMenu = menu?.trim();
        console.log(cleanMenu);
        if (cleanMenu && cleanMenu != '') {
            query.where('la.menu', cleanMenu);
            countQuery.where('la.menu', cleanMenu);
        }
        const rows = await query;
        const [{
            total
        }] = await countQuery;

        return {
            rows,
            total
        };
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