import db from "../config/db";
import PosisiUsaha from "../models/PosisiUsaha";
import { posisiUsahaCode } from "../utils/constant";

export default class PosisiUsahaController {
    static async getPosisiUsahaToday(req, res) {
        const { code } = req.query
        try {
            const today = db.raw('CURDATE()');
            const posisiUsaha = await db("type_variabel")
                .join("posisi_usaha", "type_variabel.id", "posisi_usaha.type_id")
                .where("type_variabel.code", code)
                .whereRaw('DATE(posisi_usaha.created_at) = CURDATE()')
                .select(db.raw("SUM(posisi_usaha.amount) as amount"))
                .groupByRaw('DATE(posisi_usaha.created_at)')
                .first();

            return res.status(200).json({ posisiUsaha });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch posisi usaha', errors: error.message });
        }
    }

    static async getPosisiUsaha(req, res) {
        try {
            const { page = 1, limit = 10, search = "", code = null, startDate, endDate, group_id } = req.query;
            const p = parseInt(page, 10) || 1;
            const l = parseInt(limit, 10) || 10;
            const offset = (p - 1) * l;

            const { history, total: totalData } = await PosisiUsaha.getHistory({ startDate, endDate, offset, limit: l, code, group_id })
            const jumlah = await PosisiUsaha.getTotalAmount({ startDate, endDate, code })
            const jumlahTotal = parseFloat(jumlah || 0);

            const total = parseInt(totalData || 0, 10);
            return res.status(200).json({
                history,
                jumlah: jumlahTotal,
                pagination: {
                    total,
                    page: p,
                    limit: l,
                    totalPages: Math.ceil(total / l),
                },
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to fetch angsuran', errors: err.message });
        }
    }

    static async savePosisiUsaha(req, res) {
        const { tanggal_input, group_id, code, total, raw_formula } = req.body
        const id = req.params?.id || null
        const user = req.user
        try {
            const data = {
                code,
                amount: total,
                user_id: user.id || null,
                group_id,
                tanggal_input,
                raw_formula: raw_formula,
                posisi_usaha_id: id || null
            }
            await PosisiUsaha.insertUpdatePosisiUsahaById(data)
            return res.status(200).json({
                message: "success"
            })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to save target anggota', errors: error.message, user });
        }
    }

    static async getDataMingguLalu(req, res) {
        try {
            const { tanggal_input, group_id, code } = req.query
            const result = await PosisiUsaha.getDataMingguLalu(tanggal_input, group_id, code)
            console.log(`result`,result);
            
            return res.status(200).json({
                target_minggu_lalu: result?.amount || 0
            })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch target anggota', errors: error.message });
        }
    }

    static async getDataThisWeek(req, res) {
        try {
            const { tanggal_input, code } = req.query
            console.log(`tanggal_input`, tanggal_input, code);
            
            const result = await PosisiUsaha.getDataThisWeek(tanggal_input, code)
            console.log(`resultt`,result);
            
            return res.status(200).json({
                amount: result?.amount || 0
            })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to fetch target anggota', errors: error.message });
        }
    }

    static async saveTarget(req, res) {
        const { drop, lunas, tanggal_input, group_id, target_minggu_lalu, code } = req.body
        const id = req.params?.id || null
        const user = req.user
        try {

            const result = parseInt(drop) - parseInt(lunas) + parseInt(target_minggu_lalu)
            const raw_formula = {
                drop,
                lunas
            }
            const data = {
                code,
                amount: result,
                user_id: user.id || null,
                group_id,
                tanggal_input,
                raw_formula: JSON.stringify(raw_formula),
                posisi_usaha_id: id || null
            }
            await PosisiUsaha.insertUpdatePosisiUsahaById(data)
            return res.status(200).json({
                message: "success"
            })
        } catch (error) {
            return res.status(500).json({ error: 'Failed to save target anggota', errors: error.message, user });
        }
    }



    static async getPosisiUsahaById(req, res) {
        try {
            const id = req.params?.id || null

            const result = await PosisiUsaha.getPosisiUsaha(id)
            return res.status(200).json({
                posisi_usaha: result,
                message: "Posisi usaha berhasil diambil"
            })
        } catch (error) {
            return res.status(500).json({ error: 'Posisi usaha gagal diambil', errors: error.message });
        }
    }
    static async deletePosisiUsaha(req, res) {
        try {
            const id = req.params?.id || null

            const result = await PosisiUsaha.deletePosisiUsaha(id)
            return res.status(200).json({
                message: "Posisi usaha berhasil dihapus"
            })
        } catch (error) {
            return res.status(500).json({ error: 'Posisi usaha gagal dihapus', errors: error.message });
        }
    }
}
