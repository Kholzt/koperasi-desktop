import db from "../config/db";

export default class PosisiUsaha {
    static filter({
        startDate,
        endDate,
        code,
        group_id
    }) {
        return (qb) => {
            qb.whereNull("posisi_usaha.deleted_at")

            qb.where("type_variabel.code", code)
            if (group_id) {
                qb.where("group_id", group_id)
            }
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

    static async getTotalAmount({
        startDate,
        endDate,
        code
    }) {
        const posisiUsaha = await db('posisi_usaha')
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .where(PosisiUsaha.filter({
                startDate,
                endDate,
                code
            }))
            .select(db.raw('SUM(amount) as jumlah'))
            .first();
        const jumlah = posisiUsaha.jumlah
        return jumlah
    }
    static async getHistory({
        startDate,
        endDate,
        offset,
        limit,
        code,
        group_id
    }) {
        const totalRes = await db('posisi_usaha')
            .where(PosisiUsaha.filter({
                startDate,
                endDate,
                code,
                group_id
            }))
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .select(db.raw('COUNT(DISTINCT DATE(posisi_usaha.tanggal_input)) as total'))
            .first();
        const history = await db("posisi_usaha")
            .select(
                db.raw("DATE(posisi_usaha.tanggal_input) AS tanggal"),
                db.raw("SUM(amount) AS jumlah"),
                db.raw("groups.group_name AS group_name"),
                db.raw("max(posisi_usaha.id) as id")
            )
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
            .where(PosisiUsaha.filter({
                startDate,
                endDate,
                code,
                group_id
            }))
            .whereNull("posisi_usaha.deleted_at")
            .groupByRaw("DATE(posisi_usaha.tanggal_input), groups.group_name")
            .orderBy("tanggal", "desc")
            .limit(limit)
            .offset(offset);
        const total = totalRes.total
        return {
            history,
            total
        }
    }

    static async insertUpdatePosisiUsaha({
        code,
        amount,
        user_id,
        group_id,
        tanggal_input
    }) {
        const typeVar = await db("type_variabel").where("code", code).first();
        const isModalDo = code == "modaldo"

        const baseQuery = () => {
            let query = db("posisi_usaha")
                .where("type_id", typeVar.id)
                .whereRaw(`DATE(tanggal_input) = '${tanggal_input}'`)
                .whereNull("deleted_at");
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
                group_id: isModalDo ? null : group_id,
            });
        }

        return await baseQuery().update({
            amount: Math.max(parseInt(posisiUsaha.amount) + parseInt(amount), 0),
            updated_by: user_id,
        });
    }
    static async insertUpdatePosisiUsahaById({
        code,
        amount,
        user_id,
        group_id,
        tanggal_input,
        raw_formula,
        posisi_usaha_id
    }) {
        const typeVar = await db("type_variabel").where("code", code).first();

        let posisiUsaha = null;
        if (posisi_usaha_id) {
            posisiUsaha = await db("posisi_usaha")
                .whereNull("deleted_at")
                .where("id", posisi_usaha_id).first();
        }

        if (!posisiUsaha) {
            return await db("posisi_usaha").insert({
                type_id: typeVar.id,
                amount,
                created_by: user_id,
                tanggal_input: tanggal_input,
                group_id: group_id,
                raw_formula: raw_formula
            });
        }

        // 3. Logika Update (Hanya jika data ditemukan)
        return await db("posisi_usaha").where("id", posisi_usaha_id).update({
            amount: amount,
            updated_by: user_id,
            tanggal_input: tanggal_input,
            raw_formula: raw_formula
        });
    }

    static async getDataMingguLalu(date, group_id, code) {
        const typeVar = await db("type_variabel").where("code", code).first();
        return await db("posisi_usaha")
            .select("amount")
            .where("type_id", typeVar.id)
            .where("group_id", group_id)
            .whereNull("deleted_at")
            .whereRaw(`posisi_usaha.tanggal_input = DATE_SUB('${date}', INTERVAL 7 DAY)`)
            .first()
    }

    static async getDataThisWeek(date, code) {
        try {
            const typeVar = await db("type_variabel").where("code", code).first();
            
            if (!typeVar) return null;
            return await db("posisi_usaha")
                .select(
                    db.raw("COALESCE(SUM(amount), 0) as amount")
                )
                .where("type_id", typeVar.id)
                .where("tanggal_input", date)
                .whereNull("deleted_at")
                .first();
        } catch (error) {
            return error;
        }
    }

    static async getPosisiUsaha(id) {
        return db('posisi_usaha')
            .where({
                id
            })
            .whereNull("deleted_at")
            .first();
    }
    static async deletePosisiUsaha(id) {
        return db('posisi_usaha').where({
            id
        }).update({
            deleted_at: new Date()
        });
    }
}