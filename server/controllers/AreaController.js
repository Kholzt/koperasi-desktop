import { body, validationResult } from 'express-validator';
import AreaModel from '../models/Area.js';
import { logActivity } from './services/logActivity.js';
import { ACTIVITY_ACTION, ACTIVITY_ENTITY, ACTIVITY_MENU } from '../constants/activityConstant.js';
import { diffObject } from '../helpers/diffObject.js';

export default class AreaController {
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, search = "", status = "aktif" } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            const rows = await AreaModel.findAll({ search, limit: parseInt(limit), offset, status });
            const total = await AreaModel.getTotal(search, status);

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
                areas: Array.from(map.values()),
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

    static async count(req, res) {
        try {
            const total = await AreaModel.count();
            res.status(200).json({ total });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async show(req, res) {
        try {
            const rows = await AreaModel.findById(req.params.id);
            if (!rows.length) return res.status(404).json({ error: 'Area tidak ditemukan' });
            const area = {
                ...rows[0],
                pos: { nama_pos: rows[0].nama_pos }
            }
            res.status(200).json({ area });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async store(req, res) {
        await body('area_name').notEmpty().run(req);
        await body('city').notEmpty().run(req);
        await body('subdistrict').notEmpty().run(req);
        await body('village').notEmpty().run(req);
        await body('pos_id').notEmpty().run(req);
        await body('address').notEmpty().run(req);
        await body('status').isIn(['aktif', 'nonAktif']).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, e) => {
                acc[e.path] = e.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { area_name, city, subdistrict, village, address, status, pos_id } = req.body;

            const exists = await AreaModel.existsByName(area_name);
            if (exists) return res.status(400).json({ errors: { area_name: 'Nama area sudah ada' } });

            const area = await AreaModel.create({ area_name, city, subdistrict, village, address, status, pos_id });

            logActivity({
                user: req.user,
                action: ACTIVITY_ACTION.CREATE,
                menu: ACTIVITY_MENU.WILAYAH,
                entityReff: ACTIVITY_ENTITY.AREAS,
                entityId: area,
                description: `Menambahkan wilayah ${area_name}`,
                newValue: { area_name, city, subdistrict, village, address, status, pos_id },
            }).catch(err => console.error('Failed to log activity:', err));

            res.status(200).json({ message: 'Area berhasil dibuat', area });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        await body('area_name').notEmpty().run(req);
        await body('city').notEmpty().run(req);
        await body('subdistrict').notEmpty().run(req);
        await body('village').notEmpty().run(req);
        await body('address').notEmpty().run(req);
        await body('pos_id').notEmpty().run(req);
        await body('status').isIn(['aktif', 'nonAktif']).run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, e) => {
                acc[e.path] = e.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { id } = req.params;
            const { area_name, city, subdistrict, village, address, status, pos_id } = req.body;

            const area = await AreaModel.findById(id);
            if (!area) return res.status(404).json({ error: 'Area tidak ditemukan' });

            const duplicate = await AreaModel.existsByNameExceptId(area_name, id);
            if (duplicate) return res.status(400).json({ errors: { area_name: 'Nama area sudah terdaftar' } });

            const { oldValue, newValue } = diffObject(area[0], { area_name, city, subdistrict, village, address, status, pos_id });

            await AreaModel.update(id, { area_name, city, subdistrict, village, address, status, pos_id });

            logActivity({
                user: req.user,
                action: ACTIVITY_ACTION.UPDATE,
                menu: ACTIVITY_MENU.WILAYAH,
                entityReff: ACTIVITY_ENTITY.AREAS,
                entityId: id,
                description: `Mengupdate wilayah ${area_name}`,
                oldValue,
                newValue,
            }).catch(err => console.error('Failed to log activity:', err));

            res.status(200).json({ message: 'Area updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const area = await AreaModel.findById(id);
            if (!area) return res.status(404).json({ error: 'Area tidak ditemukan' });

            const hasRelations = await AreaModel.checkContraint(id);
            if (hasRelations) {
                return res.status(409).json({ error: 'Wilayah gagal dihapus, Data sedang digunakan di bagian lain sistem' });
            }

            await AreaModel.softDelete(id);

            logActivity({
                user: req.user,
                action: ACTIVITY_ACTION.DELETE,
                menu: ACTIVITY_MENU.WILAYAH,
                entityReff: ACTIVITY_ENTITY.AREAS,
                entityId: id,
                description: `Menghapus wilayah ${area[0].area_name}`,
                oldValue: area[0],
            }).catch(err => console.error('Failed to log activity:', err));

            res.status(200).json({ message: 'Area berhasil dihapus', area });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
