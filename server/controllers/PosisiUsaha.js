import db from "../config/db";

export default class PosisiUsaha {
    static async getPosisiUsahaAll(req, res) {
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
    static async getAngsuran(req, res) {
        try {
            const { page = 1, limit = 10, search = "", status = "aktif", startDate, endDate } = req.query;
            const p = parseInt(page, 10) || 1;
            const l = parseInt(limit, 10) || 10;

            // build where clause for date range if provided
            const dateWhere = (qb) => {
                if (startDate && endDate) {
                    qb.whereRaw('DATE(tanggal_pembayaran) BETWEEN ? AND ?', [startDate, endDate]);
                } else if (startDate) {
                    qb.whereRaw('DATE(tanggal_pembayaran) >= ?', [startDate]);
                } else if (endDate) {
                    qb.whereRaw('DATE(tanggal_pembayaran) <= ?', [endDate]);
                }
            };

            // total distinct date groups for pagination
            const totalRes = await db('angsuran').where(function () { dateWhere(this); }).select(db.raw('COUNT(DISTINCT DATE(tanggal_pembayaran)) as total')).first();
            const total = parseInt(totalRes?.total || 0, 10);

            const offset = (p - 1) * l;

            const angsuran = await db("angsuran")
                .select(
                    db.raw("DATE(tanggal_pembayaran) AS tanggal"),
                    db.raw("SUM(jumlah_bayar + jumlah_katrol) AS jumlah")
                )
                .where(function () { dateWhere(this); })
                .groupByRaw("DATE(tanggal_pembayaran)")
                .orderBy("tanggal", "desc")
                .limit(l)
                .offset(offset);

            // total sum across filtered rows (not grouped)
            const sumRes = await db('angsuran').where(function () { dateWhere(this); }).select(db.raw('SUM(jumlah_bayar + jumlah_katrol) as jumlah')).first();
            const jumlahTotal = parseFloat(sumRes?.jumlah || 0);

            return res.status(200).json({
                angsuran,
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
            return res.status(500).json({ error: 'Failed to fetch angsuran' });
        }
    }
    static async getModalDo(req, res) {
        try {
            const { page = 1, limit = 10, search = "", status = "aktif", startDate, endDate } = req.query;
            const p = parseInt(page, 10) || 1;
            const l = parseInt(limit, 10) || 10;

            const dateExpr = 'DATE(DATE_SUB(tanggal_angsuran_pertama, INTERVAL 7 DAY))';
            const dateWhere = (qb) => {
                if (startDate && endDate) {
                    qb.whereRaw(`${dateExpr} BETWEEN ? AND ?`, [startDate, endDate]);
                } else if (startDate) {
                    qb.whereRaw(`${dateExpr} >= ?`, [startDate]);
                } else if (endDate) {
                    qb.whereRaw(`${dateExpr} <= ?`, [endDate]);
                }
            };

            const totalRes = await db('pinjaman').where(function () { dateWhere(this); }).select(db.raw(`COUNT(DISTINCT ${dateExpr}) as total`)).first();
            const total = parseInt(totalRes?.total || 0, 10);

            const offset = (p - 1) * l;

            const modaldo = await db("pinjaman")
                .select(
                    db.raw(`${dateExpr} AS tanggal`),
                    db.raw("SUM(modal_do) AS jumlah")
                )
                .where(function () { dateWhere(this); })
                .groupByRaw(`${dateExpr}`)
                .orderBy("tanggal", "desc")
                .limit(l)
                .offset(offset);

            const sumRes = await db('pinjaman').where(function () { dateWhere(this); }).select(db.raw('SUM(modal_do) as jumlah')).first();
            const jumlahTotal = parseFloat(sumRes?.jumlah || 0);

            return res.status(200).json({
                modaldo,
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
            return res.status(500).json({ error: 'Failed to fetch modal do' });
        }
    }
}
