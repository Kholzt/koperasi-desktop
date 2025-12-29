import db from "../config/db";
import PosisiUsaha from "../models/PosisiUsaha";

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
            return res.status(500).json({ error: 'Failed to fetch posisi usaha', errors: error });
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
            return res.status(500).json({ error: 'Failed to fetch angsuran', errors: err });
        }
    }



}
