import {
    body,
    validationResult
} from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export default class UserController {
    static async index(req, res) {
        try {
            const {
                page = 1, limit = 10, search = '', status = "aktif"
            } = req.query;
            const pagination = await User.findAll({
                page: parseInt(page),
                limit: parseInt(limit),
                search,
                status
            });
            const map = new Map();
            for (const row of pagination.users) {
                if (!map.has(row.id)) {
                    map.set(row.id, {
                        ...row,
                        pos: {
                            nama_pos: row.nama_pos
                        },
                    });
                }
            }
            res.status(200).json({
                users: Array.from(map.values()),
                pagination: {
                    total: pagination.total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(pagination.total / limit),
                },
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }

    static async show(req, res) {
        try {
            const {
                id
            } = req.params;
            const rows = await User.findById(id);
            if (!rows) return res.status(404).json({
                error: 'Pengguna tidak ditemukan'
            });
            const user = {
                ...rows,
                pos: {
                    nama_pos: rows.nama_pos
                },
            }
            res.status(200).json({
                user
            });
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred while retrieving the user.'
            });
        }
    }

    static async store(req, res) {
        await body('username').notEmpty().withMessage('Username wajib diisi').run(req);
        await body('complete_name').notEmpty().withMessage('Nama lengkap wajib diisi').run(req);
        await body('role').notEmpty().withMessage('Role wajib diisi').run(req);
        await body('pos_id').notEmpty().run(req);
        await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status harus aktif atau nonAktif').run(req);
        await body('password').isLength({
            min: 6
        }).withMessage('Password harus 6 karakter atau lebih').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formatted = errors.array().reduce((acc, e) => ({
                ...acc,
                [e.path]: e.msg
            }), {});
            return res.status(400).json({
                errors: formatted
            });
        }

        try {
            const {
                username,
                complete_name,
                role,
                access_apps,
                position,
                status,
                password,
                pos_id
            } = req.body;

            const existingUser = await User.findByUsernameOnly(username);
            if (existingUser) return res.status(400).json({
                errors: {
                    username: 'Username sudah terdaftar'
                }
            });

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                username,
                complete_name,
                role,
                access_apps: 'access',
                position,
                status,
                password: hashedPassword,
                pos_id
            });

            res.status(200).json({
                message: 'Pengguna berhasil dibuat',
                user
            });
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred while creating the user.'
            });
        }
    }

    static async update(req, res) {
        await body('username').notEmpty().withMessage('Username wajib diisi').run(req);
        await body('complete_name').notEmpty().withMessage('Nama lengkap wajib diisi').run(req);
        await body('role').notEmpty().withMessage('Role wajib diisi').run(req);
        await body('pos_id').notEmpty().run(req);
        await body('password')
            .optional({
                checkFalsy: true
            })
            .isLength({
                min: 6
            })
            .withMessage('Password minimal 6 karakter')
            .run(req);
        await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status harus aktif atau nonAktif').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formatted = errors.array().reduce((acc, e) => ({
                ...acc,
                [e.path]: e.msg
            }), {});
            return res.status(400).json({
                errors: formatted
            });
        }

        try {
            const {
                id
            } = req.params;
            const {
                username,
                complete_name,
                role,
                access_apps,
                position,
                status,
                password,
                pos_id
            } = req.body;

            const user = await User.findById(id);
            if (!user) return res.status(404).json({
                error: 'Pengguna tidak ditemukan'
            });

            const existingUser = await User.existsByUsernameExcludingId(username, id);
            if (existingUser) return res.status(400).json({
                errors: {
                    username: 'Username sudah terdaftar'
                }
            });

            const payload = {
                username,
                complete_name,
                role,
                position,
                status,
                pos_id,
                access_apps: 'access',
            };

            // ✅ Hanya tambahkan password jika ada
            if (password && password.trim() !== '') {
                payload.password = await bcrypt.hash(password, 10); // jangan lupa hash jika diperlukan
            }

            await User.update(id, payload);

            res.status(200).json({
                message: 'User updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred while updating the user.'
            });
        }
    }

    static async delete(req, res) {
        try {
            const {
                id
            } = req.params;
            const user = await User.findById(id);
            if (!user) return res.status(404).json({
                error: 'Pengguna tidak ditemukan'
            });

            const isUsed = await User.checkContraint(id);
            if (isUsed) {
                return res.status(409).json({
                    error: 'Karyawan gagal dihapus, Data sedang digunakan dibagian lain sistem',
                });
            }

            await User.softDelete(id);
            res.status(200).json({
                user
            });
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred while deleting the user.'
            });
        }
    }
}