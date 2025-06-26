import db from "../config/db";

export default class Angsuran {
    static async findByIdAngsuran(idAngsuran) {
        const row = await db("angsuran")
            .select("angsuran.*", "pinjaman.jumlah_angsuran")
            .join("pinjaman", "angsuran.id_pinjaman", "pinjaman.id")
            .where("angsuran.id", idAngsuran)
            .first();

        if (!row) return null;

        const penagih = await db("penagih_angsuran")
            .select("users.complete_name", "users.id")
            .join("users", "penagih_angsuran.id_karyawan", "users.id")
            .where("penagih_angsuran.id_angsuran", row.id);

        return {
            id: row.id,
            jumlah_bayar: row.jumlah_bayar,
            jumlah_katrol: row.jumlah_katrol,
            jumlah_angsuran: row.jumlah_angsuran,
            asal_pembayaran: row.asal_pembayaran,
            status: row.status,
            tanggal_pembayaran: row.tanggal_pembayaran,
            penagih: penagih.map(p => ({
                complete_name: p.complete_name,
                id: p.id
            })),
        };
    }


    static async findById(id) {
        return await db("angsuran").select("angsuran.*", "jumlah_angsuran").join("pinjaman", "angsuran.id_pinjaman", "pinjaman.id").where("angsuran.id", id).first();
    }
    static async findByIdPinjamanOnlyOne(id) {
        return await db("pinjaman").where("id", id).first();
    }
    static async updateAngsuran(id, data) {
        return await db("angsuran").where("id", id).update(data);
    }
    static async createPenagihAngsuran(data) {
        return await db("penagih_angsuran").insert(data);
    }
    static async deletePenagihAngsuranByIdAngsuran(id) {
        return await db("penagih_angsuran").where("id_angsuran", id).delete();
    }
    static async createAngsuran({ idPinjaman, tanggalPembayaran, status, jumlah_bayar, jumlah_katrol, asal_pembayaran = null }) {
        const [id] = await db("angsuran").insert({ jumlah_bayar, jumlah_katrol, id_pinjaman: idPinjaman, asal_pembayaran, status: "aktif", tanggal_pembayaran: tanggalPembayaran, status });
        return id;
    }
    static async updatePinjaman(idPinjaman, data) {
        return await db("pinjaman").where("id", idPinjaman).update(data);
    }
    static async getLastAngsuran(idPinjaman) {
        return await db("angsuran").where("id_pinjaman", idPinjaman).orderBy("tanggal_pembayaran", "desc").first();
    }

    static async getAngsuranAktifByIdPeminjaman(idPeminjaman, ignoreId = null) {
        const query = db("angsuran")
            .where("id_pinjaman", idPeminjaman)
            .where("status", "aktif")
            .orderBy("tanggal_pembayaran", "asc");
        if (ignoreId) {
            query.whereNot("id", ignoreId)
        }

        return await query.first()
    }


    static async updateSisaPembayaran(idPinjaman) {
        const pinjaman = await db("pinjaman").where("id", idPinjaman).first();
        const [sumResult] = await db("angsuran")
            .where("id_pinjaman", idPinjaman)
            .sum({ total_katrol: "jumlah_katrol" })
            .sum({ total_bayar: "jumlah_bayar" });

        const totalAngsuran = (Number(sumResult.total_katrol) || 0) + (Number(sumResult.total_bayar) || 0);
        const sisaPembayaran = Number(pinjaman.total_pinjaman) - totalAngsuran;
        console.log(sisaPembayaran, totalAngsuran);
        return await db("pinjaman").where("id", idPinjaman).update({
            sisa_pembayaran: sisaPembayaran <= 0 ? 0 : sisaPembayaran,
            status: sisaPembayaran <= 0 ? "lunas" : "aktif"
        });


    }
}
