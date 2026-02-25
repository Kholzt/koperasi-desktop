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
        // Validasi input
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
            const now = new Date();
            const transactionDate = date ?? now;

            const code = await Transaction.generateCode({ category_id, transaction_type });
            const existingTransaction = await Transaction.getTransactionsByInfo({
                category: category_id,
                date: transactionDate,
                desc: description,
                type: transaction_type,
                resource
            });
            console.log("DARI TRANSAKSI STORE", resource);
            if (existingTransaction && resource != "transaksi") {
                // Gunakan regex untuk menghapus semua karakter kecuali angka dan titik
            const cleanExisting = String(existingTransaction.amount).replace(/[^0-9.-]+/g, "");
            const cleanNominal = String(nominal).replace(/[^0-9.-]+/g, "");

            const totalNewAmount = Number(cleanExisting) + Number(cleanNominal);

            await Transaction.update({ amount: totalNewAmount }, existingTransaction.id);
                await Transaction.createLog({
                    id_transaksi: existingTransaction.id,
                    updated_by: user,
                    status: status ?? 'edit',
                    meta,
                    reason: reason ?? TransactionController._getDefaultReason(resource, 'edit')
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
                    created_at: now,
                    date: transactionDate,
                    resource
                });

                const isStandardResource = ['angsuran', 'pinjaman'].includes(resource);
                const metas = {};
                if (!isStandardResource) {
                    metas['Nominal'] = { original: '', updated: nominal };
                    metas['Pos'] = { original: '', updated: pos_id };
                    metas['Kategori'] = { original: '', updated: category_id };
                    metas['Keterangan'] = { original: '', updated: description };
                    metas['Tipe Transaksi'] = { original: '', updated: transaction_type };
                }

                await Transaction.createLog({
                    id_transaksi: loanId,
                    updated_by: user,
                    status: 'add',
                    meta: JSON.stringify(metas),
                    reason: reason ?? TransactionController._getDefaultReason(resource, 'add')
                });
            }


            res.status(200).json({ message: 'Transaksi berhasil dibuat' });
        } catch (error) {
            res.status(500).json({ error: `Terjadi kesalahan saat menyimpan transaksi: ${error.message}` });
        }
    }

    static _getDefaultReason(resource, action) {
        const reasonMap = {
            angsuran: `${action} angsuran`,
            pinjaman: `${action} pinjaman`,
            default: `${action} transaksi`
        };
        return reasonMap[resource] || reasonMap.default;
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
            }, id);

            const metas = {};
            if (transaction.pos_id != pos_id) {
                metas['Pos'] = { original: transaction.pos_id, updated: pos_id };
            }
            if (transaction.category_id != category_id) {
                metas['Kategori'] = { original: transaction.category_id, updated: category_id };
            }
            if (transaction.description != description) {
                metas['Keterangan'] = { original: transaction.description, updated: description };
            }
            if (transaction.amount != nominal) {
                metas['Nominal'] = { original: transaction.amount, updated: nominal };
            }
            if (transaction.transaction_type != transaction_type) {
                metas['Tipe Transaksi'] = { original: transaction.transaction_type, updated: transaction_type };
            }

            await Transaction.createLog({
                id_transaksi: id,
                updated_by: user,
                status: "edit",
                meta: JSON.stringify(metas),
                reason: reason
            });

            res.status(200).json({
                message: 'Transaksi berhasil diubah'
            });
        } catch (error) {
            res.status(500).json({ error: `Terjadi kesalahan saat menyimpan transaksi: ${error.message}` });
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
