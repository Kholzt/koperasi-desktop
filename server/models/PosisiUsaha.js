import db from "../config/db";

export default class PosisiUsaha {
    static filter({ startDate, endDate, code, group_id }) {
        return (qb) => {
            qb.where("type_variabel.code", code)
            if (startDate && endDate) {
                qb.whereBetween(
                    qb.client.raw('DATE(posisi_usaha.tanggal_input)'),
                    [startDate, endDate]
                );
            } else if (startDate) {
                qb.whereRaw('DATE(posisi_usaha.tanggal_input) = ?', [startDate]);
            } else if (endDate) {
                qb.whereRaw('DATE(posisi_usaha.tanggal_input) = ?', [endDate]);
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
    static async getHistory({ startDate, endDate, offset, limit, code, group_id }) {
        const totalRes = await db('posisi_usaha')
            .where(PosisiUsaha.filter({ startDate, endDate, code, group_id }))
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .select(db.raw('COUNT(DISTINCT DATE(posisi_usaha.tanggal_input)) as total'))
            .first();
        const history = await db("posisi_usaha")
            .select(
                db.raw("DATE(posisi_usaha.tanggal_input) AS tanggal"),
                db.raw("SUM(amount) AS jumlah")
            )
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .where(PosisiUsaha.filter({ startDate, endDate, code, group_id }))
            .groupByRaw("DATE(posisi_usaha.tanggal_input)")
            .orderBy("tanggal", "desc")
            .limit(limit)
            .offset(offset);
        const total = totalRes.total
        return { history, total }
    }

    static async insertUpdatePosisiUsaha({ code, amount, user_id, group_id, tanggal_input }) {
        const typeVar = await db("type_variabel").where("code", code).first();
        const isModalDo = code == "modaldo"

        const baseQuery = () => {
            let query = db("posisi_usaha")
                .where("type_id", typeVar.id)
                .whereRaw(`DATE(tanggal_input) = '${tanggal_input}'`);
            if (!isModalDo) {
                query.where("group_id", group_id);
            }

            return query;
        };

        const posisiUsaha = await baseQuery().first();

        if (!posisiUsaha) {
            return await baseQuery().insert({
                type_id: typeVar.id,
                amount,
                created_by: user_id,
                tanggal_input: tanggal_input,
                group_id: isModalDo ? null : group_id
            });
        }

        return await baseQuery().update({
            amount: Math.max(parseInt(posisiUsaha.amount) + parseInt(amount), 0),
            updated_by: user_id
        });
    }

}
