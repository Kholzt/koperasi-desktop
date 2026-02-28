import { body, validationResult } from 'express-validator';
import db from "../config/db.js"; // db adalah instance knex
import { logActivity } from './services/logActivity.js';
import { ACTIVITY_ACTION, ACTIVITY_ENTITY, ACTIVITY_MENU } from '../constants/activityConstant.js';
import { diffObject } from '../helpers/diffObject.js';

export default class EmployeController {
    // Menampilkan daftar pengguna dengan pagination
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, search = "", status = "aktif" } = req.query;
            const pageInt = parseInt(page);
            const limitInt = parseInt(limit);
            const offset = (pageInt - 1) * limitInt;
            const usersQuery = db('users')
                .leftJoin("pos", "users.pos_id", "pos.id")
                .leftJoin("group_details", "users.id", "group_details.staff_id")
                .leftJoin("groups", "group_details.group_id", "groups.id")
                .select(
                    "users.*",
                    "pos.nama_pos",
                    db.raw("MIN(groups.group_name) as group_name")
                )
                .whereNull('users.deleted_at')
                .andWhere('users.complete_name', 'like', `%${search}%`)
                .andWhere('users.access_apps', 'noAccess')
                .groupBy("users.id")
                .orderBy('users.id', 'desc')
                .limit(limitInt)
                .offset(offset);

            if (status != "all") usersQuery.where("status", status);
            const rows = await usersQuery;

            const usersCount = db('users')
                .whereNull('deleted_at')
                .andWhere('complete_name', 'like', `%${search}%`)
                .andWhere('access_apps', 'noAccess')
                .count('id as total');
            if (status != "all") usersCount.where("status", status);
            const [{ total }] = await usersCount;
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
        await body('nip').notEmpty().run(req);
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
            const { complete_name, position, status, tanggal_masuk, tanggal_keluar, jenis_ijazah, status_ijazah, pos_id, address, nip } = req.body;
            ;
            // const nip = await generateNip();
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
                pos_id,
                nip,
                address
            });

            const newUser = await db('users').where('id', insertedId).first();

            logActivity({
                user: req.user,
                action: ACTIVITY_ACTION.CREATE,
                menu: ACTIVITY_MENU.KARYAWAN,
                entityReff: ACTIVITY_ENTITY.USER,
                entityId: insertedId,
                description: `Menambahkan karyawan ${complete_name}`,
                newValue: {
                    complete_name, position, status, tanggal_masuk, tanggal_keluar,
                    jenis_ijazah, status_ijazah, pos_id, nip, address
                },
            }).catch(err => {
                console.error('Failed to log activity:', err);
            });

            res.status(200).json({
                message: 'Pengguna berhasil dibuat',
                user: newUser,
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while creating the user.', errors: error });
        }
    }

    // Mengupdate data pengguna dengan pengecekan
    static async update(req, res) {
        await body('complete_name').notEmpty().withMessage('Nama lengkap wajib diisi').run(req);
        await body('jenis_ijazah').notEmpty().withMessage('Jenis Ijazah wajib diisi').run(req);
        await body('tanggal_masuk').notEmpty().withMessage('Tanggal Masuk wajib diisi').run(req);
        await body('position').notEmpty().withMessage('Posisi wajib diisi').run(req);
        await body('pos_id').notEmpty().run(req);
        await body('nip').notEmpty().run(req);
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
            const { complete_name, position, status, tanggal_masuk, tanggal_keluar, jenis_ijazah, status_ijazah, pos_id, address, nip } = req.body;

            const existingUser = await db('users').where('id', id).first();
            if (!existingUser) {
                return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
            }

            const { oldValue, newValue } = diffObject(existingUser, {
                complete_name, position, status, tanggal_masuk, tanggal_keluar,
                jenis_ijazah, status_ijazah, pos_id, address, nip
            });

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
                    pos_id,
                    address,
                    nip
                });

            logActivity({
                user: req.user,
                action: ACTIVITY_ACTION.UPDATE,
                menu: ACTIVITY_MENU.KARYAWAN,
                entityReff: ACTIVITY_ENTITY.USER,
                entityId: id,
                description: `Mengupdate karyawan ${complete_name}`,
                oldValue,
                newValue,
            }).catch(err => {
                console.error('Failed to log activity:', err);
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
            await updateNip(id)
            await db('users').where('id', id).update({ deleted_at: new Date() });

            logActivity({
                user: req.user,
                action: ACTIVITY_ACTION.DELETE,
                menu: ACTIVITY_MENU.KARYAWAN,
                entityReff: ACTIVITY_ENTITY.USER,
                entityId: id,
                description: `Menghapus karyawan ${user.complete_name}`,
                oldValue: user,
            }).catch(err => {
                console.error('Failed to log activity:', err);
            });

            res.status(200).json({ user });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the user.' });
        }
    }
    static async generateNip(req, res) {
        try {
            const [{ total }] = await db("users")
                .whereNull("users.deleted_at")
                .andWhere("access_apps", "noAccess")
                // .andWhere("status", "aktif")
                .orderBy("id", "desc")
                .count({ total: "*" });

            // if (!lastEmployee || !lastEmployee.nip) return "000001";

            // const lastNipNumber = parseInt(lastEmployee.nip, 10);
            const nextNipNumber = total + 1;
            // Format ke 6 digit dengan leading zero
            res.json({ nip: String(nextNipNumber).padStart(6, "0") });
        } catch (error) {
            console.log(error);
            throw new Error(error.message);

        }
    }
    static async checkNip(req, res) {
        try {
            const { nip, ignoreId } = req.query;
            const user = db("users").where("nip", nip).whereNull("deleted_at")
            if (ignoreId) user.whereNot("id", ignoreId);
            const exist = await user.first();
            res.json({ isExist: !!exist })
        } catch (error) {
            res.json({ errors: error.message })
        }
    }

}




async function updateNip(id) {
    const users = await db("users").whereRaw("id > " + id).whereNull("users.deleted_at")
    await Promise.all(
        users.map(async (user) => {
            const nipNumber = parseInt(user.nip, 10);
            const newNipNumber = nipNumber - 1;
            await db("users").where("id", user.id).update({
                nip:
                    String(newNipNumber).padStart(6, "0")
            })
        })
    )
}
