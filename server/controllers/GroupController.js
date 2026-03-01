import { body, validationResult } from 'express-validator';
import GroupModel from '../models/Group.js';
import { logActivity } from './services/logActivity.js';
import { ACTIVITY_ACTION, ACTIVITY_ENTITY, ACTIVITY_MENU } from '../constants/activityConstant.js';
import { diffObject } from '../helpers/diffObject.js';

export default class GroupController {
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const { rows, total } = await GroupModel.findAll({ page, limit, search });

            const map = new Map();
            for (const row of rows) {
                if (!map.has(row.group_id)) {
                    map.set(row.group_id, {
                        id: row.group_id,
                        group_name: row.group_name,
                        pos_id: row.pos_id,
                        pos: { nama_pos: row.nama_pos },
                        staffs: [],
                    });
                }
                if (row.staff_id) {
                    map.get(row.group_id).staffs.push({
                        id: row.staff_id,
                        complete_name: row.staff_name,
                    });
                }
            }

            res.status(200).json({
                groups: Array.from(map.values()),
                pagination: {
                    total,
                    page: +page,
                    limit: +limit,
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
            const rows = await GroupModel.findById(id);

            if (!rows.length) return res.status(404).json({ error: 'Kelompok tidak ditemukan' });

            const group = {
                id: rows[0].group_id,
                group_name: rows[0].group_name,
                pos_id: rows[0].pos_id,
                pos: { nama_pos: rows[0].nama_pos },
                staffs: rows
                    .filter(r => r.staff_id)
                    .map(r => ({ id: r.staff_id, complete_name: r.staff_name })),
            };

            res.status(200).json({ group });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async store(req, res) {
        await body('group_name').notEmpty().run(req);
        await body('staffs').isArray({ min: 1 }).run(req);
        await body('staffs.*').notEmpty().run(req);
        await body('pos_id').notEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formatted = errors.array().reduce((acc, err) => {
                acc[err.path] = err.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formatted });
        }

        try {
            const { group_name, staffs, pos_id } = req.body;
            //   const exists = await GroupModel.existsByName(group_name);
            //   if (exists) {
            //     return res.status(400).json({ errors: { group_name: 'Nama group sudah ada' } });
            //   }

            const id = await GroupModel.create({ group_name, pos_id });
            await GroupModel.insertStaffs(id, staffs);

            logActivity({
                user: req.user,
                action: ACTIVITY_ACTION.CREATE,
                menu: ACTIVITY_MENU.KELOMPOK,
                entityReff: ACTIVITY_ENTITY.GROUPS,
                entityId: id,
                description: `Menambahkan kelompok ${group_name}`,
                newValue: { group_name, pos_id, staffs },
            }).catch(err => {
                console.error('Failed to log activity:', err);
            });

            res.status(200).json({ message: 'Kelompok berhasil dibuat', group: { id, group_name } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        await body('group_name').notEmpty().run(req);
        await body('staffs').isArray({ min: 1 }).run(req);
        await body('staffs.*').notEmpty().run(req);
        await body('pos_id').notEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formatted = errors.array().reduce((acc, err) => {
                acc[err.path] = err.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formatted });
        }

        try {
            const { id } = req.params;
            const { group_name, staffs, pos_id } = req.body;

            //   const exists = await GroupModel.existsByName(group_name, id);
            //   if (exists) {
            //     return res.status(400).json({ errors: { group_name: 'Nama group sudah terdaftar' } });
            //   }

            const oldData = await GroupModel.findById(id);
            if (!oldData.length) return res.status(404).json({ error: 'Kelompok tidak ditemukan' });

            const { oldValue, newValue } = diffObject(oldData[0], { group_name, pos_id });

            await GroupModel.update(id, { group_name, pos_id });
            await GroupModel.deleteGroupDetails(id);
            await GroupModel.insertStaffs(id, staffs);

            logActivity({
                user: req.user,
                action: ACTIVITY_ACTION.UPDATE,
                menu: ACTIVITY_MENU.KELOMPOK,
                entityReff: ACTIVITY_ENTITY.GROUPS,
                entityId: id,
                description: `Mengupdate kelompok ${group_name}`,
                oldValue,
                newValue: { group_name, pos_id, staffs },
            }).catch(err => {
                console.error('Failed to log activity:', err);
            });

            res.status(200).json({ message: 'Kelompok updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const isUsed = await GroupModel.checkContraint(id);
            if (isUsed) {
                return res.status(409).json({
                    error: 'Kelompok gagal dihapus, Data sedang digunakan dibagian lain sistem',
                });
            }
            await GroupModel.softDelete(id);
            res.status(200).json({ message: 'Kelompok berhasil dihapus' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async count(req, res) {
        try {
            const total = await GroupModel.count();
            res.status(200).json({ total });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
