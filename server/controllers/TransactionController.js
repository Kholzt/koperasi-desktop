import { body, validationResult } from 'express-validator';
import db from "../config/db.js";
import Transaction from '../models/Transaction.js';
import { isHoliday } from '../config/holidays.js';
import PosModel from '../models/Pos.js';
import CategoryModel from '../models/Category.js';

export default class TransactionController {
    // Menampilkan daftar area dengan pagination
    static async index(req, res) {
        try {
            const {
                startDate = new Date(),
                endDate = null,
                'transaction_type[]': rawTransaction_type = null,
                'categories[]': rawCategories = null,
                'groups[]': rawGroups = null,
                pos = null,
                isPusatAdmin
            } = req.query;
            // pastikan jadi array
            const categories = rawCategories
                ? Array.isArray(rawCategories) ? rawCategories : [rawCategories]
                : [];
            const transaction_type = rawTransaction_type
                ? Array.isArray(rawTransaction_type) ? rawTransaction_type : [rawTransaction_type]
                : [];

            const groups = rawGroups
                ? Array.isArray(rawGroups) ? rawGroups : [rawGroups]
                : [];
            // Query transactions with join to members
            const { transactions } = await Transaction.findAll({ startDate, endDate, transaction_type, categories, groups, pos, isPusatAdmin })


            res.status(200).json({
                transactions,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    static async labaRugi(req, res) {
        try {
            const {
                startDate = null,
                endDate = null,
                'transaction_type[]': rawTransaction_type = null,
                'categories[]': rawCategories = null,
                'groups[]': rawGroups = null,
                pos = null
            } = req.query;
            // pastikan jadi array
            const categories = rawCategories
                ? Array.isArray(rawCategories) ? rawCategories : [rawCategories]
                : [];
            const transaction_type = rawTransaction_type
                ? Array.isArray(rawTransaction_type) ? rawTransaction_type : [rawTransaction_type]
                : [];

            const groups = rawGroups
                ? Array.isArray(rawGroups) ? rawGroups : [rawGroups]
                : [];
            // Query transactions with join to members
            const { transactions } = await Transaction.labaRugi({ startDate, endDate, transaction_type, categories, groups, pos })


            res.status(200).json({
                transactions,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    static async getGroupTransaction(req, res) {
        try {
            const groups = await Transaction.getGroupTransaction();

            res.status(200).json({ groups });
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred while retrieving the transaction.',
                errors: error,
            });
        }
    }
    // Menampilkan detail area berdasarkan ID
    static async show(req, res) {
        try {
            const { id } = req.params;
            const transaction = await Transaction.findById(id);

            res.status(200).json({ transaction });
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred while retrieving the transaction.',
                errors: error,
            });
        }
    }







    static async store(req, res) {
        await body('pos_id').notEmpty().withMessage('Pos wajib diisi').run(req);
        await body('category_id').notEmpty().withMessage('Kategori wajib diisi').run(req);
        await body('description').notEmpty().withMessage('Keterangan wajib diisi').run(req);
        await body('transaction_type').notEmpty().withMessage('Jenis transaksi wajib diisi').run(req);
        await body('nominal').notEmpty().withMessage('Nominal wajib diisi').run(req);
        await body('user').notEmpty().withMessage('User wajib diisi').run(req);
        await body('resource').notEmpty().withMessage('Resource wajib diisi').run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { category_id, pos_id, description, transaction_type, nominal, date, user, resource, meta, reason, status } = req.body;


            const code = await Transaction.generateCode({ category_id, transaction_type });

            const now = new Date();
            const isUpdate = await Transaction.getTransactionsByInfo({ category: category_id, date: date ?? now, desc: description, type: transaction_type });

            if (isUpdate) {
                await Transaction.update({ amount: isUpdate.amount + nominal }, isUpdate.id);
                await Transaction.createLog({
                    id_transaksi: isUpdate.id,
                    updated_by: user,
                    status: status ?? "edit",
                    meta: meta,
                    reason: reason ?? (resource == "angsuran" ? "edit angsuran" : (resource == "pinjaman" ? "edit pinjaman" : "edit transaksi"))

                });
            } else {
                const loanId = await Transaction.create({
                    category_id,
                    pos_id,
                    description,
                    transaction_type,
                    amount: nominal,
                    code,
                    created_by: user,
                    created_at: now, date: date ?? now,
                    resource
                });
                await Transaction.createLog({
                    id_transaksi: loanId,
                    updated_by: user,
                    status: "add",
                    meta: (resource != "angsuran" && resource != "pinjaman") ? JSON.stringify(["Nominal", "pos", "category", "description", "transaction_type", "amount", "created_by"]) : meta,
                    reason: resource == "angsuran" ? "add angsuran" : (resource == "pinjaman" ? "add pinjaman" : "add transaksi")

                });
            }

            res.status(200).json({
                message: 'Transaksi berhasil dibuat',
            });

        } catch (error) {
            res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan transaksi: ' + error.message });
        }
    }


    // Mengupdate data area dengan pengecekan dan enkripsi password jika ada perubahan
    static async update(req, res) {
        await body('pos_id').notEmpty().withMessage('Pos wajib diisi').run(req);
        await body('category_id').notEmpty().withMessage('Kategori wajib diisi').run(req);
        await body('description').notEmpty().withMessage('Keterangan wajib diisi').run(req);
        await body('transaction_type').notEmpty().withMessage('Jenis transaksi wajib diisi').run(req);
        await body('nominal').notEmpty().withMessage('Nominal wajib diisi').run(req);
        await body('user').notEmpty().withMessage('User wajib diisi').run(req);
        await body('resource').notEmpty().withMessage('Resource wajib diisi').run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { pos_id, category_id, description, transaction_type, nominal, date, user, reason, resource } = req.body;
            const { id } = req.params;

            const transaction = await Transaction.findById(id);
            const now = new Date(date);

            await Transaction.update({
                pos_id,
                category_id,
                description,
                transaction_type,
                updated_by: user,
                amount: nominal,
                date: now,
                resource
                // date: date ?? now
            }, id);

            let metas = [];
            const newPos = await PosModel.findById(pos_id);
            const newCategory = await CategoryModel.findById(category_id);
            if (transaction.pos_id != pos_id) {
                metas.push("Pos");
            }

            if (transaction.category_id != category_id) {
                metas.push("Kategori");
            }

            if (transaction.description != description) {
                metas.push("Keterangan");
            }

            if (transaction.amount != nominal) {
                metas.push("Nominal");
            }

            if (transaction.transaction_type != transaction_type) {
                metas.push("Tipe Transaksi");
            }
            await Transaction.createLog({
                id_transaksi: id,
                updated_by: user,
                status: "edit",
                meta: JSON.stringify(metas),
                reason: reason

            });

            res.status(200).json({
                message: 'Transaksi berhasil diubah',
            });

        } catch (error) {
            res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan transaksi: ' + error.message });
        }
    }



    // Menampilkan detail area berdasarkan ID
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const { user, reason } = req.body;
            const pinjaman = await Transaction.findById(id);
            if (!pinjaman) {
                return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
            }

            await Transaction.softDelete(id);
            await Transaction.createLog({
                id_transaksi: id,
                updated_by: user,
                status: "delete",
                meta: {},
                reason: reason

            });
            res.status(200).json({
                pinjaman: pinjaman,
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the pinjaman.', errorss: error });
        }
    }


}
