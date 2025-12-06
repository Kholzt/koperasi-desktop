import db from "../config/db";

export default class PosisiUsaha {

    static async getAngsuran(req, res) {
        const angsuran = await db("angsuran")
            .select(
                "tanggal_pembayaran",
                db.raw("SUM(jumlah_bayar + jumlah_katrol) AS jumlah_angsuran")
            ).orderBy("tanggal_pembayaran", "desc").groupBy("tanggal_pembayaran")

        const today = new Date().toISOString().split("T")[0]

        const angsuranHariIni = await db("angsuran")
            .select(
                db.raw("SUM(jumlah_bayar + jumlah_katrol) AS jumlah_angsuran")
            )
            .where("tanggal_pembayaran", today)
            .first()
        return res.status(200).json({
            angsuran,
            angsuran_hari_ini: angsuranHariIni?.jumlah_angsuran || 0

        })
    }
}
