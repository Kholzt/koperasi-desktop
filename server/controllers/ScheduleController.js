import { body, validationResult } from 'express-validator';
import ScheduleModel from '../models/Schedule.js';

export default class ScheduleController {
    static async index(req, res) {
        const { page = 1, limit = 10, day } = req.query;

        try {
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const rows = await ScheduleModel.findAll({ limit: parseInt(limit), offset, day });

            const total = await ScheduleModel.getTotal(day);

            const schedule = rows.map(row => ({
                id: row.id,
                day: row.day,
                status: row.status,
                pos: { nama_pos: row.nama_pos },
                area: {
                    id: row.area_id,
                    area_name: row.area_name
                },
                group: {
                    id: row.group_id,
                    group_name: row.group_name
                }
            }));

            res.status(200).json({
                schedule,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async show(req, res) {
        try {
            const { id } = req.params;
            const row = await ScheduleModel.findById(id);
            if (!row) {
                return res.status(404).json({ error: 'Schedule tidak ditemukan' });
            }
            const schedule = {
                ...row,
                pos: { nama_pos: row.nama_pos },
            }
            res.status(200).json({ schedule });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async store(req, res) {
        await body('area_id').notEmpty().withMessage('Wilayah wajib diisi').run(req);
        await body('group_id').notEmpty().withMessage('Kelompok wajib diisi').run(req);
        await body('day').notEmpty().withMessage('Hari wajib diisi').run(req);
        await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status must be active or inactive').run(req);
        await body('pos_id').notEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { area_id, group_id, day, status, pos_id } = req.body;

            const conflict = await ScheduleModel.checkContraint({ area_id, group_id, day });
            if (conflict) {
                return res.status(409).json({
                    error: `Jadwal konflik dengan kelompok ${conflict.group_name} di wilayah ${conflict.area_name} pada hari ${day}`
                });
            }

            const [newId] = await ScheduleModel.create({ area_id, group_id, day, status, pos_id });
            const newSchedule = await ScheduleModel.findById(newId);

            res.status(200).json({
                message: 'Schedule berhasil dibuat',
                area: newSchedule,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        await body('area_id').notEmpty().withMessage('Wilayah wajib diisi').run(req);
        await body('group_id').notEmpty().withMessage('Kelompok wajib diisi').run(req);
        await body('day').notEmpty().withMessage('Hari wajib diisi').run(req);
        await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status must be active or inactive').run(req);
        await body('pos_id').notEmpty().run(req);

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
            const { area_id, group_id, day, status, pos_id } = req.body;

            const existing = await ScheduleModel.findById(id);
            if (!existing) {
                return res.status(404).json({ error: 'Schedule tidak ditemukan' });
            }

            const conflict = await ScheduleModel.checkContraint({ area_id, group_id, day, excludeId: id });
            if (conflict) {
                return res.status(409).json({
                    error: `Jadwal konflik dengan kelompok ${conflict.group_name} di wilayah ${conflict.area_name} pada hari ${day}`
                });
            }

            await ScheduleModel.update(id, { area_id, group_id, day, status, pos_id });

            res.status(200).json({ message: 'Schedule updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const existing = await ScheduleModel.findById(id);
            if (!existing) {
                return res.status(404).json({ error: 'Schedule tidak ditemukan' });
            }

            await ScheduleModel.softDelete(id);

            res.status(200).json({
                message: 'Schedule deleted successfully',
                schedule: existing,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
