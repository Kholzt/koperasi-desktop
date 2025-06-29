import { body, validationResult } from 'express-validator';
import PosModel from '../models/Pos.js';

export default class PosController {
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const { rows, total } = await PosModel.findAll({ page, limit, search });

            const map = new Map();
            for (const row of rows) {
                if (!map.has(row.id)) {
                    map.set(row.id, {
                        ...row,
                        penanggungJawab: {
                            complete_name: row.complete_name
                        },
                    });
                }
            }

            res.status(200).json({
                pos: Array.from(map.values()),
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
            const rows = await PosModel.findById(id);

            if (!rows.length) return res.status(404).json({ error: 'Pos tidak ditemukan' });

            const pos = {
                ...rows[0],
                penanggungJawab: {
                    complete_name: rows[0].complete_name
                },
            };

            res.status(200).json({ pos });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async store(req, res) {
        await body('nama_pos').notEmpty().run(req);
        await body('alamat').notEmpty().run(req);
        await body('no_telepon').notEmpty().run(req);
        await body('penanggung_jawab').notEmpty().run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formatted = errors.array().reduce((acc, err) => {
                acc[err.path] = err.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formatted });
        }

        try {
            const { nama_pos, alamat, no_telepon, penanggung_jawab } = req.body;
            const exists = await PosModel.existsByName(nama_pos);
            if (exists) {
                return res.status(400).json({ errors: { nama_pos: 'Nama pos sudah ada' } });
            }

            const id = await PosModel.create({ nama_pos, alamat, no_telepon, penanggung_jawab });

            res.status(200).json({ message: 'Pos berhasil dibuat', pos: { id, nama_pos } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        await body('nama_pos').notEmpty().run(req);
        await body('alamat').notEmpty().run(req);
        await body('no_telepon').notEmpty().run(req);
        await body('penanggung_jawab').notEmpty().run(req);

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
            const { nama_pos, alamat, no_telepon, penanggung_jawab } = req.body;

            const exists = await PosModel.existsByName(nama_pos,id);
            if (exists) {
                return res.status(400).json({ errors: { nama_pos: 'Nama pos sudah ada' } });
            }

            await PosModel.update(id, { nama_pos, alamat, no_telepon, penanggung_jawab });

            res.status(200).json({ message: 'Pos updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const isUsed = await PosModel.checkContraint(id);
            if (isUsed) {
                return res.status(409).json({
                    error: 'Pos gagal dihapus, Data sedang digunakan dibagian lain sistem',
                });
            }
            await PosModel.softDelete(id);
            res.status(200).json({ message: 'Pos berhasil dihapus' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async count(req, res) {
        try {
            const total = await PosModel.count();
            res.status(200).json({ total });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
