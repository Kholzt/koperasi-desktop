import { body, validationResult } from 'express-validator';
import db from "../config/db.js"; // db adalah instance knex

export default class EmployeController {
    // Menampilkan daftar pengguna dengan pagination
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const pageInt = parseInt(page);
            const limitInt = parseInt(limit);
            const offset = (pageInt - 1) * limitInt;

            const rows = await db('users')
                .select("users.*", "nama_pos")
                .whereNull('users.deleted_at')
                .andWhere('complete_name', 'like', `%${search}%`)
                .andWhere('access_apps', 'noAccess')
                .leftJoin("pos", "users.pos_id", "pos.id")
                .orderBy('users.id', 'desc')
                .where("users.status", "aktif")
                .limit(limitInt)
                .offset(offset);

            const [{ total }] = await db('users')
                .whereNull('deleted_at')
                .andWhere('complete_name', 'like', `%${search}%`)
                .andWhere('access_apps', 'noAccess')
                .where("status", "aktif")
                .count('id as total');
            const map = new Map();
            for (const row of rows) {
                if (!map.has(row.id)) {
                    map.set(row.id, {
                        ...row,
                        pos: { nama_pos: row.nama_pos },
                    });
                }
            }
            res.status(200).json({
                employees: Array.from(map.values()),
                pagination: {
                    total: parseInt(total),
                    page: pageInt,
                    limit: limitInt,
                    totalPages: Math.ceil(total / limitInt),
                },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async count(req, res) {
        try {
            const [{ total }] = await db('users')
                .whereNull('deleted_at')
                .count('id as total');

            res.status(200).json({ total: parseInt(total) });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Menampilkan detail pengguna berdasarkan ID
    static async show(req, res) {
        try {
            const { id } = req.params;
            const rows = await db('users')
                .select("users.*", "nama_pos")
                .where('users.id', id)
                .leftJoin("pos", "users.pos_id", "pos.id")
                .first();

            if (!rows) {
                return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
            }
            const user = {
                ...rows,
                pos: { nama_pos: rows.nama_pos },

            }
            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the user.' });
        }
    }

    // Menyimpan pengguna baru dengan validasi dan enkripsi password
    static async store(req, res) {
        await body('complete_name').notEmpty().withMessage('Nama lengkap wajib diisi').run(req);
        await body('position').notEmpty().withMessage('Posisi wajib diisi').run(req);
        await body('pos_id').notEmpty().run(req);
        await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status harus aktif dan nonAktif').run(req);
        await body('status_ijazah').isIn(['belum diambil', 'sudah diambil']).withMessage('Status ijazah tidak valid').run(req);
        // await body('masa_kerja').notEmpty().withMessage('Masa kerja wajib diisi').run(req);
        await body('jenis_ijazah').notEmpty().withMessage('Jenis Ijazah wajib diisi').run(req);
        await body('tanggal_masuk').notEmpty().withMessage('Tanggal Masuk wajib diisi').run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});

            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { complete_name, position, status, tanggal_masuk, tanggal_keluar, jenis_ijazah, status_ijazah, pos_id } = req.body;

            const [insertedId] = await db('users').insert({
                complete_name,
                role: "staff",
                access_apps: "noAccess",
                position,
                status,
                tanggal_masuk,
                tanggal_keluar,
                jenis_ijazah,
                status_ijazah,
                pos_id
            });

            const newUser = await db('users').where('id', insertedId).first();

            res.status(200).json({
                message: 'Pengguna berhasil dibuat',
                user: newUser,
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while creating the user.' });
        }
    }

    // Mengupdate data pengguna dengan pengecekan
    static async update(req, res) {
        await body('complete_name').notEmpty().withMessage('Nama lengkap wajib diisi').run(req);
        await body('jenis_ijazah').notEmpty().withMessage('Jenis Ijazah wajib diisi').run(req);
        await body('tanggal_masuk').notEmpty().withMessage('Tanggal Masuk wajib diisi').run(req);
        await body('position').notEmpty().withMessage('Posisi wajib diisi').run(req);
        await body('pos_id').notEmpty().run(req);
        await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status harus aktif dan nonAktif').run(req);
        await body('status_ijazah').isIn(['belum diambil', 'sudah diambil']).withMessage('Status ijazah tidak valid').run(req);
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});

            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { id } = req.params;
            const { complete_name, position, status, tanggal_masuk, tanggal_keluar, jenis_ijazah, status_ijazah, pos_id } = req.body;

            const existingUser = await db('users').where('id', id).first();
            if (!existingUser) {
                return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
            }

            await db('users')
                .where('id', id)
                .update({
                    complete_name,
                    role: "staff",
                    position,
                    status,
                    tanggal_masuk,
                    tanggal_keluar,
                    jenis_ijazah,
                    status_ijazah,
                    pos_id
                });

            res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while updating the user.', errors: error });
        }
    }

    // Soft delete user dengan pengecekan constraint
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const user = await db('users').where('id', id).first();

            if (!user) {
                return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
            }

            const sqlConstraintChecks = [
                db('users')
                    .join('group_details', 'users.id', 'group_details.staff_id')
                    .join('groups', 'group_id', 'groups.id')
                    .where('access_apps', 'noAccess').andWhere('users.id', id).whereNull('groups.deleted_at'),
                db('users').join('pinjaman', 'users.id', 'pinjaman.penanggung_jawab')
                    .where('access_apps', 'noAccess').andWhere('users.id', id).whereNull('pinjaman.deleted_at'),
            ];

            for (const query of sqlConstraintChecks) {
                const dataConstraint = await query.select();
                if (dataConstraint.length > 0) {
                    return res.status(409).json({ error: 'Karyawan gagal dihapus, Data sedang digunakan dibagian lain sistem' });
                }
            }

            await db('users').where('id', id).update({ deleted_at: new Date() });

            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the user.' });
        }
    }
}
