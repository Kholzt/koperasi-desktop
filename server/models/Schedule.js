// models/ScheduleModel.js
import db from "../config/db.js";

const ScheduleModel = {
    async findAll({ limit, offset, day, status = "aktif" }) {
        const query = db('schedule')
            .select(
                'schedule.id',
                'day',
                'schedule.status',
                'groups.id as group_id',
                'groups.group_name',
                'areas.id as area_id',
                'areas.area_name',
                "nama_pos"
            )
            .select("schedule.*", "nama_pos")
            .leftJoin("pos", "schedule.pos_id", "pos.id")
            .join('areas', 'schedule.area_id', 'areas.id')
            .join('groups', 'schedule.group_id', 'groups.id')
            .whereNull('schedule.deleted_at')
            .orderBy('schedule.id', 'desc')

            .limit(limit)
            .offset(offset);

        if (day) query.andWhere('day', day);
        if (status != "all") query.where("schedule.status", status);

        return await query;
    },

    async getTotal(day = null, status = "aktif") {
        const query = db('schedule')
            .leftJoin("pos", "schedule.pos_id", "pos.id")
            .join('areas', 'schedule.area_id', 'areas.id')
            .join('groups', 'schedule.group_id', 'groups.id')
            .whereNull('schedule.deleted_at')
            .orderBy('schedule.id', 'desc')
            ;
        if (day) query.andWhere('day', day);
        const [{ total }] = await query.count({ total: '*' });
        if (status != "all") query.where("schedule.status", status);

        return total;
    },

    async findById(id) {
        return await db('schedule')
            .select("schedule.*", "nama_pos")
            .leftJoin("pos", "schedule.pos_id", "pos.id")
            .where("schedule.id", id).first();
    },

    async checkContraint({ area_id, group_id, day, excludeId = null }) {
        const query = db('schedule')
            .join('areas', 'schedule.area_id', 'areas.id')
            .join('groups', 'schedule.group_id', 'groups.id')
            .where({ 'schedule.area_id': area_id, 'schedule.group_id': group_id, day }).whereNull('schedule.deleted_at');

        if (excludeId) {
            query.andWhereNot('schedule.id', excludeId);
        }

        return query.first();
    },

    async create(data) {
        return db('schedule').insert(data);
    },

    async update(id, data) {
        return await db('schedule')
            .where({ id })
            .update(data);
    },

    async softDelete(id) {
        return await db('schedule')
            .where({ id })
            .update({ deleted_at: new Date() });
    },
};

export default ScheduleModel;
