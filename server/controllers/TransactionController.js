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
            const { transactions } = await Transaction.findAll({ startDate, endDate, transaction_type, categories, groups, pos })


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



    static async getCode(req, res) {
        try {
            const { id } = req.params;
            const rows = await db("pinjaman").where("anggota_id", id).whereNull("deleted_at");
            const member = await db("members").select("sequence_number").where("id", id).first();
            console.log(rows);
            let num = rows.length + 1;
            const roman = [
                ["M", 1000],
                ["CM", 900],
                ["D", 500],
                ["CD", 400],
                ["C", 100],
                ["XC", 90],
                ["L", 50],
                ["XL", 40],
                ["X", 10],
                ["IX", 9],
                ["V", 5],
                ["IV", 4],
                ["I", 1]
            ];

            // let result = "";
            // let romanVal = member.sequence_number;
            // for (const [letter, value] of roman) {
            //     while (romanVal >= value) {
            //         result += letter;
            //         romanVal -= value;
            //     }
            // }
            // const romanLength = result;
            // const code = `${romanLength}/${num}`;
            let result = "";
            // let romanVal = member.sequence_number;
            for (const [letter, value] of roman) {
                while (num >= value) {
                    result += letter;
                    num -= value;
                }
            }
            const romanLength = result;
            const code = `${romanLength}/${member.sequence_number}`;
            res.status(200).json({
                code, rows, member, num, result
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the area.' + error.message });
        }
    }




    static async store(req, res) {
        await body('pos_id').notEmpty().withMessage('Pos wajib diisi').run(req);
        await body('category_id').notEmpty().withMessage('Kategori wajib diisi').run(req);
        await body('description').notEmpty().withMessage('Keterangan wajib diisi').run(req);
        await body('transaction_type').notEmpty().withMessage('Jenis transaksi wajib diisi').run(req);
        await body('nominal').notEmpty().withMessage('Nominal wajib diisi').run(req);
        await body('user').notEmpty().withMessage('User wajib diisi').run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { category_id, pos_id, description, transaction_type, nominal, date, user } = req.body;

            // const loanExist = await Transaction.existTransaction(anggota_id, kode);
            // if (loanExist) {
            //     return res.status(400).json({ errors: { kode: 'Kode sudah ada' } });
            // }
            const code = await Transaction.generateCode({ category_id, transaction_type });

            const now = new Date();
            const isUpdate = await Transaction.getTransactionsByInfo({ category: category_id, date: date ?? now, desc: description, type: transaction_type });
            if (isUpdate) {
                isUpdate.update({ amount: nominal });
            } else {
                const loanId = await Transaction.create({
                    category_id,
                    pos_id,
                    description,
                    transaction_type,
                    amount: nominal,
                    code,
                    created_by: user,
                    created_at: now, date: date ?? now
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


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { pos_id, category_id, description, transaction_type, nominal, date, user, reason } = req.body;
            const { id } = req.params;

            // const loanExist = await Transaction.existTransaction(anggota_id, kode);
            // if (loanExist) {
            //     return res.status(400).json({ errors: { kode: 'Kode sudah ada' } });
            // }
            const transaction = await Transaction.findById(id);
            const now = new Date(date);

            await Transaction.update({
                pos_id,
                category_id,
                description,
                transaction_type,
                updated_by: user,
                amount: nominal,
                date: now
                // date: date ?? now
            }, id);

            let metas = {};
            const newPos = await PosModel.findById(pos_id);
            const newCategory = await CategoryModel.findById(category_id);
            if (transaction.pos_id != pos_id)
                metas["POS"] = { old: transaction.pos.nama_pos, new: newPos[0].nama_pos };

            if (transaction.category_id != category_id)
                metas["Kategori"] = { old: transaction.category.name, new: newCategory[0].name };

            if (transaction.description != description)
                metas["Keterangan"] = { old: transaction.description, new: description };

            if (transaction.amount != nominal)
                metas["Nominal"] = { old: transaction.amount, new: nominal };

            if (transaction.transaction_type != transaction_type)
                metas["Tipe Transaksi"] = { old: transaction.transaction_type, new: transaction_type };

            await Transaction.createLog({
                id_transaksi: id,
                updated_by: user,
                status: "edit",
                meta: metas,
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
