import { body, validationResult } from 'express-validator';
import CategoryModel from '../models/Category.js';

export default class CategoryController {
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const { rows, total } = await CategoryModel.findAll({ page, limit, search });

            const map = new Map();
            for (const row of rows) {
                if (!map.has(row.id)) {
                    map.set(row.id, {
                        ...row,
                        // penanggungJawab: {
                        //     complete_name: row.complete_name
                        // },
                    });
                }
            }

            res.status(200).json({
                categories: Array.from(map.values()),
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
            const rows = await CategoryModel.findById(id);

            if (!rows.length) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

            const category = {
                ...rows[0],
                // penanggungJawab: {
                //     complete_name: rows[0].complete_name
                // },
            };

            res.status(200).json({ category });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async store(req, res) {
        await body('name').notEmpty().run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formatted = errors.array().reduce((acc, err) => {
                acc[err.path] = err.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formatted });
        }

        try {
            const { name } = req.body;
            const exists = await CategoryModel.existsByName(name);
            if (exists) {
                return res.status(400).json({ errors: { nama_pos: 'Nama kategori sudah ada' } });
            }
            const code = await CategoryModel.generateCode();
            const id = await CategoryModel.create({ name, code });

            res.status(200).json({ message: 'Kategori berhasil dibuat', kategori: { id, name } });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        await body('name').notEmpty().run(req);

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
            const { name } = req.body;

            const exists = await CategoryModel.existsByName(name, id);
            if (exists) {
                return res.status(400).json({ errors: { nama_pos: 'Nama kategori sudah ada' } });
            }

            await CategoryModel.update(id, { name });

            res.status(200).json({ message: 'Kategori updated successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const isUsed = await CategoryModel.checkContraint(id);
            if (isUsed) {
                return res.status(409).json({
                    error: 'Kategori gagal dihapus, Data sedang digunakan dibagian lain sistem',
                });
            }
            await CategoryModel.softDelete(id);
            res.status(200).json({ message: 'Kategori berhasil dihapus' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async count(req, res) {
        try {
            const total = await CategoryModel.count();
            res.status(200).json({ total });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}
