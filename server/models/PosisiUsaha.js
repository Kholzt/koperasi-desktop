import db from "../config/db";

export default class PosisiUsaha {
    static filter({ startDate, endDate, code }) {
        return (qb) => {
            qb.where("type_variabel.code", code)
            if (startDate && endDate) {
                qb.whereBetween(
                    qb.client.raw('DATE(posisi_usaha.created_at)'),
                    [startDate, endDate]
                );
            } else if (startDate) {
                qb.whereRaw('DATE(posisi_usaha.created_at) >= ?', [startDate]);
            } else if (endDate) {
                qb.whereRaw('DATE(posisi_usaha.created_at) <= ?', [endDate]);
            }
        };
    }

    static async getTotalAmount({ startDate, endDate, code }) {
        const posisiUsaha = await db('posisi_usaha')
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .where(PosisiUsaha.filter({ startDate, endDate, code }))
            .select(db.raw('SUM(amount) as jumlah'))
            .first();
        const jumlah = posisiUsaha.jumlah
        return jumlah
    }
    static async getHistory({ startDate, endDate, offset, limit, code }) {
        const totalRes = await db('posisi_usaha')
            .where(PosisiUsaha.filter({ startDate, endDate, code }))
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .select(db.raw('COUNT(DISTINCT DATE(posisi_usaha.created_at)) as total'))
            .first();
        const history = await db("posisi_usaha")
            .select(
                db.raw("DATE(posisi_usaha.created_at) AS tanggal"),
                db.raw("SUM(amount) AS jumlah")
            )
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .where(PosisiUsaha.filter({ startDate, endDate, code }))
            .groupByRaw("DATE(posisi_usaha.created_at)")
            .orderBy("tanggal", "desc")
            .limit(limit)
            .offset(offset);
        const total = totalRes.total
        return { history, total }
    }
}
