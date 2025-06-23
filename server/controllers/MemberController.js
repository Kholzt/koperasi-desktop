import { body, validationResult } from "express-validator";
import db from "../config/db.js";
import Member from "../models/Member.js";

export default class MemberController {
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);

            // Query data dengan join dan filter search
            const { rows, total } = await Member.findAll({ offset, search, limit });

            // Grouping (meski sebenarnya data sudah unik di sini)
            const map = new Map();
            for (const row of rows) {
                if (!map.has(row.member_id)) {
                    const hasPinjaman = await Member.hasPinjaman(row.member_id);
                    map.set(row.member_id, {
                        id: row.member_id,
                        nik: row.nik,
                        no_kk: row.no_kk,
                        complete_name: row.complete_name,
                        address: row.address,
                        sequence_number: row.sequence_number,
                        area_id: row.area_id,
                        hasPinjaman: hasPinjaman,
                        area: {
                            id: row.area_id,
                            area_name: row.area_name,
                        },
                    });
                }
            }

            const members = Array.from(map.values());

            res.status(200).json({
                members,
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

            const total = await Member.count();
            res.status(200).json({
                total
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async show(req, res) {
        try {
            const { id } = req.params;

            const row = await Member.findById(id); // Ambil hanya satu baris

            if (!row) {
                return res.status(404).json({ error: "Anggota tidak ditemukan" });
            }

            const member = {
                id: row.member_id,
                nik: row.nik,
                no_kk: row.no_kk,
                complete_name: row.complete_name,
                address: row.address,
                area_id: row.area_id,
                area: {
                    id: row.area_id,
                    area_name: row.area_name,
                },
            };

            res.status(200).json({ member });
        } catch (error) {
            res.status(500).json({
                error: "Terjadi kesalahan saat mengambil data group. " + error.message,
            });
        }
    }




    static async store(req, res) {
        await body("complete_name").notEmpty().withMessage("Nama wajib diisi").run(req);
        await body("area_id").notEmpty().withMessage("Area wajib diisi").run(req);
        await body('address').notEmpty().withMessage('Alamat wajib diisi').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { complete_name, area_id, address, nik, no_kk } = req.body;
            const nikExist = await Member.nikExist(nik, false);
            if (nikExist) {
                return res.status(409).json({
                    message: "Nik sudah ada",
                });
            }

            const nikExistDelete = await Member.nikExist(nik, true);

            const member = await Member.getSequenceNumber();
            // res.status(500).json(member);
            const sequence_number = member ? member?.sequence_number + 1 : 1;
            const data = { nik, no_kk, complete_name, area_id, address, sequence_number, deleted_at: null };
            let memberId;
            if (!nikExistDelete) {
                memberId = await Member.create(data);
            } else {
                const member = await Member.findByNik(nik);
                memberId = await Member.update(data, member.id);
            }

            const newMember = await Member.findById(memberId);
            res.status(200).json({
                message: "Anggota berhasil dibuat",
                member: newMember,
            });
        } catch (error) {
            res.status(500).json({ error: "An error occurred while creating the group. " + error.message });
        }
    }

    static async update(req, res) {
        await body("nik").notEmpty().withMessage("NIK wajib diisi").run(req);
        await body("no_kk").notEmpty().withMessage("NO KK wajib diisi").run(req);
        await body("complete_name").notEmpty().withMessage("Nama wajib diisi").run(req);
        await body("complete_name").notEmpty().withMessage("Nama wajib diisi").run(req);
        await body("area_id").notEmpty().withMessage("Area wajib diisi").run(req);
        await body('address').notEmpty().withMessage('Alamat wajib diisi').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors, errorss: errors });
        }

        try {
            const { id } = req.params;
            const { nik, no_kk, complete_name, area_id, address } = req.body;
            const data = { complete_name, area_id, address, id, nik, no_kk }
            await Member.update(data, id);

            res.status(200).json({ message: "Anggota updated successfully" });
        } catch (error) {
            res.status(500).json({ error: "An error occurred while updating the group. " + error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const member = await Member.findById(id);
            if (!member) {
                return res.status(404).json({ error: "Anggota tidak ditemukan" });
            }

            const isUsed = await Member.checkContraint(id);
            if (isUsed) {
                return res.status(409).json({
                    error: 'Anggota gagal dihapus, Data sedang digunakan dibagian lain sistem',
                });
            }
            await Member.softDelete(id)

            res.status(200).json({
                message: "Anggota berhasil dihapus",
                member: member,
            });
        } catch (error) {
            res.status(500).json({ error: "An error occurred while deleting the member. " + error.message });
        }
    }


    static async nixExist(req, res) {
        try {
            const { nik } = req.params;
            const exist = await Member.nikExist(nik);
            res.status(200).json({
                message: "Nik sudah ada",
                nikExist: exist,
            });
        } catch (error) {
            res.status(500).json({ error: "An error occurred while deleting the member. " + error.message });
        }
    }
}
