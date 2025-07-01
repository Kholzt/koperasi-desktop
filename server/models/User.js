// models/User.js
import db from '../config/db.js';

export default class User {
    static async findAll({ page, limit, search, status = "aktif" }) {
        const offset = (page - 1) * limit;

        const usersQuery = db('users')
            .select("users.*", "nama_pos")
            .whereNull('users.deleted_at')
            .where('access_apps', 'access')
            .where('complete_name', 'like', `%${search}%`)
            .whereNot("role", "super admin")
            .leftJoin("pos", "users.pos_id", "pos.id")
            .orderBy('users.id', 'desc')
            .limit(limit)
            .offset(offset);

        if (status != "all") usersQuery.where("users.status", status)
        const users = await usersQuery;
        const countQuery = db('users')
            .whereNull('deleted_at')
            .where('access_apps', 'access')
            .where('complete_name', 'like', `%${search}%`)
            .whereNot("role", "super admin");
        if (status != "all") countQuery.where("users.status", status)
        const [{ count }] = await countQuery.count({ count: '*' });
        return { users, total: parseInt(count) };
    }

    static async findById(id) {
        return await db('users')
            .select("users.*", "nama_pos")
            .leftJoin("pos", "users.pos_id", "pos.id")
            .where("users.id", id).first();
    }

    static async findByUsername(username) {
        return await db('users')
            .where({ username, access_apps: 'access', status: 'aktif' })
            .whereNull('deleted_at')
            .first();
    }

    static async existsByUsernameExcludingId(username, id) {
        return await db('users')
            .where('username', username)
            .whereNot('id', id)
            .first();
    }

    static async create(data) {
        const [id] = await db('users').insert(data);
        return await this.findById(id);
    }

    static async update(id, data) {
        return await db('users').where({ id }).update(data);
    }

    static async softDelete(id) {
        return await db('users').where({ id }).update({ deleted_at: new Date() });
    }

    static async checkContraint(id) {
        const [result] = await db('pinjaman')
            .join('users', 'users.id', '=', 'pinjaman.petugas_input')
            .where('users.access_apps', 'access')
            .where('users.id', id)
            .select('pinjaman.id')
            .whereNull('pinjaman.deleted_at')
            .limit(1);

        return !!result;
    }

    static async findByUsernameOnly(username) {
        return await db('users').where({ username }).first();
    }
}
