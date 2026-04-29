import db from "../config/db";
import {
    getLast6DaysWithoutSunday
} from "../helpers/helpers";

export default class PosisiUsaha {
    static filter({
        startDate,
        endDate,
        code,
        group_id,
        pos_id
    }) {
        return (qb) => {
            qb.whereNull("posisi_usaha.deleted_at")

            qb.where("type_variabel.code", code)
            if (group_id) {
                qb.where("group_id", group_id)
            }
            if (pos_id) {
                qb.where((builder) => {
                    builder.where("groups.pos_id", pos_id)
                        // .orWhereNull("posisi_usaha.group_id"); // Tetap tampilkan jika tidak punya group
                });
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
            } else {
                const date = new Date();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                // Hasil: "03" (untuk Maret)
                qb.whereRaw('MONTH(posisi_usaha.tanggal_input) = ?', [month]);
            }
        };
    }

    static filterSirkulasiDaily({
        startDate,
        endDate,
        code,
        group_id,
        pos_id
    }) {
        return (qb) => {
            qb.whereNull("posisi_usaha.deleted_at")

            qb.where("type_variabel.code", code)
            if (group_id) {
                qb.where("group_id", group_id)
            }
            if (pos_id != null) {
                qb.where((builder) => {
                    builder.where("groups.pos_id", pos_id)
                        .orWhereNull("posisi_usaha.group_id"); // Tetap tampilkan jika tidak punya group
                });
            }
            if (endDate) {
                qb.whereRaw('DATE(posisi_usaha.tanggal_input) = ?', [endDate]);
            } else if (startDate) {
                qb.whereRaw('DATE(posisi_usaha.tanggal_input) = ?', [startDate]);
            } else {
                qb.whereRaw(`
                    DATE(posisi_usaha.tanggal_input) = (
                        SELECT DATE(MAX(pu.tanggal_input))
                        FROM posisi_usaha pu
                        JOIN type_variabel tv ON pu.type_id = tv.id
                        WHERE pu.deleted_at IS NULL
                        AND tv.code = ?
                    )
                `, [code]);
            }
        };
    }

    static filterSirkulasi({
        startDate,
        endDate,
        code,
        group_id,
        pos_id
    }) {
        return (qb) => {
            qb.whereNull("posisi_usaha.deleted_at")

            qb.where("type_variabel.code", code)
            if (group_id) {
                qb.where("group_id", group_id)
            }
            if (pos_id != null) {
                qb.where("pos_id", pos_id)
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
        code,
        pos_id
    }) {
        let posisiUsaha;
        if (code == 'sirkulasi') {
            posisiUsaha = await db('posisi_usaha').join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
                .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
                .where(PosisiUsaha.filterSirkulasiDaily({
                    startDate,
                    endDate,
                    code,
                    pos_id
                }))
                .whereNull('posisi_usaha.deleted_at')
                .select(db.raw('SUM(amount) as jumlah'),
                    db.raw("SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as jumlah_positif"),
                    db.raw("SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as jumlah_negatif"))
                .first();
        } else {
            posisiUsaha = await db('posisi_usaha').join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
                .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
                .where(PosisiUsaha.filter({
                    startDate,
                    endDate,
                    code,
                    pos_id
                }))
                .whereNull('posisi_usaha.deleted_at')
                .select(db.raw('SUM(amount) as jumlah'),
                    db.raw("SUM(CASE WHEN amount >= 0 THEN amount ELSE 0 END) as jumlah_positif"),
                    db.raw("SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END) as jumlah_negatif"))
                .first();
        }

        const jumlah = posisiUsaha.jumlah
        const jumlah_positif = posisiUsaha.jumlah_positif;
        const jumlah_negatif = posisiUsaha.jumlah_negatif;

        return {
            jumlah,
            jumlah_positif,
            jumlah_negatif
        }
    }

    static async getTotalAmountSirkulasi({
        startDate,
        endDate,
        code,
        pos_id
    }) {

        function formatDate(date) {
            return date.toISOString().slice(0, 10);
        }

        // ambil 6 hari kerja terakhir (skip Sunday)
        function getDefaultRange() {
            const dates = [];
            const current = new Date();

            while (dates.length < 6) {
                if (current.getDay() !== 0) {
                    dates.push(formatDate(current));
                }
                current.setDate(current.getDate() - 1);
            }

            dates.reverse();

            return {
                startDate: dates[0],
                endDate: dates[dates.length - 1],
                dates
            };
        }

        // ===== Tentukan tanggal =====
        let dates = [];

        const range = getDefaultRange();
        startDate = range.startDate;
        endDate = range.endDate;
        dates = range.dates;

        // ===== cek tanggal yang ada di database =====
        let query = db('posisi_usaha')
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
            .where('type_variabel.code', code)
            .whereNull('posisi_usaha.deleted_at');
        if (pos_id != null && pos_id !== '' && pos_id !== undefined) {
            query.where((b) => {
                b.where("groups.pos_id", pos_id)
                .orWhereNull("posisi_usaha.group_id");
            });
        }
        const existingDates = await query.select(
            db.raw("DISTINCT DATE_FORMAT(posisi_usaha.tanggal_input, '%Y-%m-%d') AS tanggal_input")
        );
        // const existingDates = await db('posisi_usaha')
        //     .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
        //     .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
        //     .where('type_variabel.code', code)
        //     .where((builder) => {
        //         if (pos_id != null) {
        //             builder.where((b) => {
        //                 b.where("groups.pos_id", pos_id)
        //                 .orWhereNull("posisi_usaha.group_id");
        //             });
        //         }
        //     })
        //     .whereNull('posisi_usaha.deleted_at')
        //     .select(
        //         db.raw("DISTINCT DATE_FORMAT(posisi_usaha.tanggal_input, '%Y-%m-%d') AS tanggal_input")
        //     );
        const existingList = existingDates
        .map(d => d.tanggal_input)
        .sort() // ASC dulu
        .reverse(); // jadi DESC (terbaru dulu)
        const usedWeekdays = [];
        const finalDates = [];
        const existingSet = existingDates.map(d => d.tanggal_input);

        // ===== fallback jika kosong =====
        // const finalDates = existingSet.slice(-6);

        for (const dateStr of existingList) {
            const day = new Date(dateStr).getDay();

            // skip Minggu
            if (day === 0) continue;

            // skip jika weekday sudah dipakai
            if (usedWeekdays.includes(day)) continue;

            finalDates.push(dateStr);
            usedWeekdays.push(day);

            // stop kalau sudah 6 hari
            if (finalDates.length === 6) break;
        }
        // const finalDates = existingSet.map(d => {

        //     // if (!existingSet.includes(d)) {
        //         return minus7Days(d);
        //     // }
        //     // return d;
        // });

        // const posisiUsaha = await db('posisi_usaha')
        //     .whereIn("posisi_usaha.tanggal_input", finalDates)
        //     .whereIn("posisi_usaha.type_id", function () {
        //         this.select("id")
        //             .from("type_variabel")
        //             .where(PosisiUsaha.filterSirkulasi({ code }));
        //     })
        //     .whereNull('posisi_usaha.deleted_at')
        //     .sum('posisi_usaha.amount as jumlah')
        //     .first();
        const posisiUsaha = await db('posisi_usaha')
            .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
            .whereIn('posisi_usaha.tanggal_input', finalDates)
            .whereNull('posisi_usaha.deleted_at')
            .whereIn('posisi_usaha.type_id', function () {
                this.select('id')
                    .from('type_variabel')
                    .where('type_variabel.code', code);
            })
            .where((builder) => {
                if (pos_id != null) {
                    builder.where((b) => {
                        b.where("groups.pos_id", pos_id)
                        // .orWhereNull("posisi_usaha.group_id");
                    });
                }
            })
            .sum('posisi_usaha.amount as jumlah')
            .first();
        const jumlah = posisiUsaha.jumlah
        const jumlah_positif = 0;
        const jumlah_negatif = 0;

        return {
            jumlah,
            jumlah_positif,
            jumlah_negatif,
            finalDates
        }
    }

    static async getHistory({
        startDate,
        endDate,
        offset,
        limit,
        code,
        group_id,
        pos_id
    }) {
        const isModalDo = code === "modaldo"
        const totalRes = await db('posisi_usaha')
            .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
            .where(PosisiUsaha.filter({
                startDate,
                endDate,
                code,
                group_id,
                pos_id
            }))
            .whereNull("posisi_usaha.deleted_at")
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            .select(db.raw( 'COUNT(DISTINCT DATE(posisi_usaha.tanggal_input), group_id) as total'))
            .first();

        const historyQuery = db("posisi_usaha")
            .select(
                db.raw("DATE(posisi_usaha.tanggal_input) AS tanggal"),
                db.raw("SUM(amount) AS jumlah"),
                // db.raw("groups.group_name AS group_name"),
                db.raw("max(posisi_usaha.id) as id"),
                db.raw("max(raw_formula) as raw_formula"),
                db.raw("max(posisi_usaha.group_id) as group_id"),
                db.raw("max(pos.nama_pos) as nama_pos"),
            )
            .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
            .leftJoin("pos", "groups.pos_id", "pos.id")
            .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
            // .leftJoin("groups", "posisi_usaha.group_id", "groups.id")
            .where(PosisiUsaha.filter({
                startDate,
                endDate,
                code,
                group_id,
                pos_id
            })).whereNull("posisi_usaha.deleted_at");

        // if (!isModalDo) {
            historyQuery
                .select(
                    db.raw("COALESCE(groups.group_name, '-') as group_name")
                )
                .groupByRaw("DATE(posisi_usaha.tanggal_input), posisi_usaha.group_id");
        // } else {
        //     historyQuery.groupByRaw("DATE(posisi_usaha.tanggal_input)");
        // }

        const history = await historyQuery
            .orderBy("tanggal", "desc")
            .limit(limit)
            .offset(offset);

        const total = totalRes ? totalRes.total : 0
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
        ref_id,
        tanggal_input

    }) {
        const typeVar = await db("type_variabel").where("code", code).first();
        const isModalDo = code == "modaldo"

        const baseQuery = () => {
            let query = db("posisi_usaha")
                .where("type_id", typeVar.id)
                .whereRaw(`DATE(tanggal_input) = '${tanggal_input}'`)
                .whereNull("deleted_at")
                .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
                .where("type_variabel.code", code)
                .where("group_id", group_id)
                .where("reference_id", ref_id)
                ;
            // if (!isModalDo) {
            // }

            return query;
        };

        const posisiUsaha = await baseQuery().first();

        if (!posisiUsaha) {
            return await baseQuery().insert({
                type_id: typeVar.id,
                amount,
                created_by: user_id,
                tanggal_input: tanggal_input,
                group_id:  group_id,
                reference_id:ref_id
            });
        }

        return await baseQuery().update({
            "posisi_usaha.amount": parseInt(amount),
            "posisi_usaha.updated_by": user_id,
        });
    }
    static async deletePosisiUsahaSync({
        code,
        ref_id,
    }) {
        const baseQuery = () => {
            let query = db("posisi_usaha")
                .whereNull("posisi_usaha.deleted_at")
                .join("type_variabel", "posisi_usaha.type_id", "type_variabel.id")
                .where("type_variabel.code", code)
                .where("reference_id", ref_id)
                ;
            // if (!isModalDo) {
            // }

            return query;
        };

        return await baseQuery().update({
           "posisi_usaha.deleted_at": new Date()
        });
    }

    static async checkDataByDate({
        code,
        tanggal_input,
        group_id,
        ignoreId
    }) {
        const typeVar = await db("type_variabel").where("code", code).first();
        const isModalDo = code == "modaldo"

        const baseQuery = () => {
            let query = db("posisi_usaha")
                .where("type_id", typeVar.id)
                .whereRaw(`DATE(tanggal_input) = '${tanggal_input}'`)
                .whereNull("deleted_at");
            // if (!isModalDo) {
                query.where("group_id", group_id);
            // }
            if (ignoreId) {
                query.whereNot("id", ignoreId);
            }

            return query;
        };

        const posisiUsaha = await baseQuery().first();

        if (!posisiUsaha) {
            return false;
        }

        return true;
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
            raw_formula: raw_formula,
            group_id: group_id
        });
    }


    static async getDataMingguLalu(date, group_id, code) {
        const typeVar = await db("type_variabel").where("code", code).first();
        if (!typeVar) return null;

        let data = null;
        let searchDate = new Date(date);

        while (!data) {
            searchDate.setDate(searchDate.getDate() - 7);
            const formattedDate = searchDate.toISOString().split('T')[0];

            data = await db("posisi_usaha")
                .select("amount")
                .where({
                    type_id: typeVar.id,
                    group_id,
                    tanggal_input: formattedDate
                })
                .whereNull("deleted_at")
                .first();

            // break jika data terlalu jauh
            if (searchDate.getFullYear() < 2020) break;
        }

        return data;
    }

    static async getDataThisWeek(date, group_id, code) {
        try {
            const typeVar = await db("type_variabel").where("code", code).first();

            if (!typeVar) return null;

            const query = db("posisi_usaha")
                .select(
                    db.raw("COALESCE(SUM(amount), 0) as amount")
                )
                .where("type_id", typeVar.id)
                .where("tanggal_input", date)
                .whereNull("deleted_at");

            if (group_id) {
                query.where("group_id", group_id);
            }

            return await query.first();
        } catch (error) {
            throw error;
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