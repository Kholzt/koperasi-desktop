// models/ScheduleModel.js
import db from "../config/db.js";

const ScheduleModel = {
  async findAll({ limit, offset, day }) {
    const query = db('schedule')
      .select(
        'schedule.id',
        'day',
        'schedule.status',
        'groups.id as group_id',
        'groups.group_name',
        'areas.id as area_id',
        'areas.area_name'
      )
      .join('areas', 'schedule.area_id', 'areas.id')
      .join('groups', 'schedule.group_id', 'groups.id')
      .whereNull('schedule.deleted_at')
      .orderBy('schedule.id', 'desc')
      .limit(limit)
      .offset(offset);

    if (day) query.andWhere('day', day);

    return await query;
  },

  async getTotal() {
    const [{ total }] = await db('schedule')
      .whereNull('deleted_at')
      .count({ total: '*' });
    return total;
  },

  async findById(id) {
    return await db('schedule').where({ id }).first();
  },

  async checkContraint({ area_id, group_id, day, excludeId = null }) {
    const query = await db('schedule')
      .join('areas', 'schedule.area_id', 'areas.id')
      .join('groups', 'schedule.group_id', 'groups.id')
      .where({ 'schedule.area_id': area_id, 'schedule.group_id': group_id, day });

    if (excludeId) {
      query.andWhereNot('schedule.id', excludeId);
    }

    return query.first();
  },

  async create({ area_id, group_id, day, status }) {
    return db('schedule').insert({ area_id, group_id, day, status });
  },

  async update(id, { area_id, group_id, day, status }) {
    return await db('schedule')
      .where({ id })
      .update({ area_id, group_id, day, status });
  },

  async softDelete(id) {
    return await db('schedule')
      .where({ id })
      .update({ deleted_at: new Date() });
  },
};

export default ScheduleModel;
