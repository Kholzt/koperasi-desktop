import db from "../config/db";

export default class PosisiUsaha {

    static async getAngsuran(req, res) {
        const angsuran = await db("angsuran")
            .select(
                db.raw("DATE(tanggal_pembayaran) AS tanggal"),
                db.raw("SUM(jumlah_bayar + jumlah_katrol) AS jumlah")
            ).orderBy("tanggal", "desc")
            .groupByRaw("DATE(tanggal_pembayaran)")

        const today = new Date().toISOString().split("T")[0]

        const angsuranHariIni = await db("angsuran")
            .select(
                db.raw("SUM(jumlah_bayar + jumlah_katrol) AS jumlah")
            )
            .whereRaw(`DATE(tanggal_pembayaran) = '${today}'`)
            .first()
        return res.status(200).json({
            angsuran,
            jumlah: angsuranHariIni?.jumlah || 0

        })
    }
    static async getModalDo(req, res) {
        const modaldo = await db("pinjaman")
            .select(
                db.raw("DATE(DATE_SUB(tanggal_angsuran_pertama, INTERVAL 7 DAY)) AS tanggal"),
                db.raw("SUM(total_pinjaman) AS jumlah")
            )
            .orderBy("tanggal", "desc")
            .groupByRaw("DATE(DATE_SUB(tanggal_angsuran_pertama, INTERVAL 7 DAY))")

        const today = new Date().toISOString().split("T")[0]

        const angsuranHariIni = await db("pinjaman")
            .select(
                db.raw("SUM(total_pinjaman) AS jumlah")
            )
            .whereRaw(`DATE(DATE_SUB(tanggal_angsuran_pertama, INTERVAL 7 DAY)) = '${today}'`)
            .first()
        return res.status(200).json({
            modaldo,
            jumlah: angsuranHariIni?.jumlah || 0

        })
    }
}
