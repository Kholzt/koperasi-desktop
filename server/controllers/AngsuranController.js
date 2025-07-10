import db from "../config/db";
import { isHoliday } from "../config/holidays";
import Angsuran from "../models/Angsuran";
import { body, validationResult } from 'express-validator';

export default class AngsuranController {
    static async index(req, res) {
        try {
            const { id } = req.params
            const angsuran = await Angsuran.findByIdAngsuran(id);
            res.status(200).json({
                angsuran,
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async store(req, res) {
        await body('penagih').isArray({ min: 1 }).run(req);
        // await body('jumlah_bayar').min({ min: 1 }).run(req);
        await body('status')
            .notEmpty()
            .run(req);
        await body('asal_pembayaran')
            .custom((value, { req }) => {
                if (req.body.status === 'lunas' && (value != 'anggota' && value != 'penagih' && value != 'katrol')) {
                    throw new Error('Jika status lunas, asal pembayaran harus anggota atau penagih');
                }
                return true;
            })
            .run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, e) => {
                acc[e.path] = e.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }
        const trx = await db.transaction();
        try {
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            const { idPinjaman } = req.params
            const { status, penagih, asal_pembayaran, jumlah_bayar, tanggal_bayar, jumlah_katrol } = req.body
            const angsuran = await Angsuran.getAngsuranAktifByIdPeminjaman(idPinjaman);
            if (!angsuran) {
                res.status(404).json({ error: "Angsuran tidak ditemukan" });
            }


            let totalTunggakan = 0;
            let sisaPembayaran = 0;
            let statusPinjaman = "aktif";
            const pinjaman = await Angsuran.findByIdPinjamanOnlyOne(angsuran.id_pinjaman);
            const jumlahBayarTotal = (parseInt(jumlah_bayar) + parseInt(jumlah_katrol));
            if ((parseInt(pinjaman.sisa_pembayaran) - jumlahBayarTotal) <= 0 && (status != "menunggak" && status != 'Libur Operasional')) {
                statusPinjaman = "lunas";
            }
            const lastAngsuran = await Angsuran.getLastAngsuran(angsuran.id_pinjaman);
            let angsuran_id = angsuran.id;
            if ((status != "menunggak" && status != 'Libur Operasional')) {
                sisaPembayaran = parseInt(pinjaman.sisa_pembayaran) - parseInt((pinjaman.sisa_pembayaran >= jumlah_bayar ? jumlah_bayar : pinjaman.sisa_pembayaran));
                sisaPembayaran = sisaPembayaran - parseInt(sisaPembayaran >= jumlah_katrol ? jumlah_katrol : sisaPembayaran)
                totalTunggakan = parseInt(pinjaman.besar_tunggakan) > 0 ? parseInt(pinjaman.besar_tunggakan) - parseInt(jumlahBayarTotal) : parseInt(pinjaman.besar_tunggakan);

                if (statusPinjaman == "lunas") totalTunggakan = 0;
                //jika tidak ada tanggal bayar update data
                if (!tanggal_bayar) {
                    await Angsuran.updateAngsuran(angsuran.id, {
                        asal_pembayaran,
                        jumlah_katrol,
                        jumlah_bayar,
                        status
                    });
                } else {
                    angsuran_id = await Angsuran.createAngsuran({
                        idPinjaman: idPinjaman,
                        jumlah_bayar,
                        jumlah_katrol,
                        asal_pembayaran,
                        tanggalPembayaran: formatDate(new Date(tanggal_bayar)),
                        status
                    });
                }
                await Angsuran.updatePinjaman(angsuran.id_pinjaman, {
                    sisa_pembayaran: sisaPembayaran,
                    //  besar_tunggakan: totalTunggakan,
                    status: statusPinjaman
                });

            } else {
                sisaPembayaran = parseInt(pinjaman.sisa_pembayaran);
                sisaPembayaran = sisaPembayaran - parseInt(sisaPembayaran >= jumlah_katrol ? jumlah_katrol : sisaPembayaran)
                totalTunggakan = parseInt(pinjaman.besar_tunggakan) + parseInt(pinjaman.jumlah_angsuran)
                if (!tanggal_bayar) {
                    await Angsuran.updateAngsuran(angsuran.id, { status: status });
                } else {
                    angsuran_id = await Angsuran.createAngsuran({
                        idPinjaman,
                        jumlah_bayar: 0,
                        asal_pembayaran,
                        jumlah_katrol,
                        tanggalPembayaran: formatDate(new Date(tanggal_bayar)),
                        status
                    });
                }

                if (status == "menunggak")
                    await Angsuran.updatePinjaman(angsuran.id_pinjaman, { sisa_pembayaran: sisaPembayaran, besar_tunggakan: totalTunggakan, status: statusPinjaman });


                const tanggalPembayaran = new Date(lastAngsuran.tanggal_pembayaran);
                let isAktifAdded = false;
                while (!isAktifAdded) {
                    tanggalPembayaran.setDate(tanggalPembayaran.getDate() + 7);
                    const isDay = await isHoliday(tanggalPembayaran);
                    if (isDay) {
                        await Angsuran.createAngsuran({
                            idPinjaman: angsuran.id_pinjaman,
                            tanggalPembayaran: formatDate(tanggalPembayaran),
                            status: "libur"
                        });
                    } else {
                        await Angsuran.createAngsuran({
                            idPinjaman: angsuran.id_pinjaman,
                            tanggalPembayaran: formatDate(tanggalPembayaran),
                            status: "aktif"
                        });
                        isAktifAdded = true;
                    }
                }
            }


            //handle jika angsuran terakhir tapi belum lunas
            const angsuranTerakhir = await Angsuran.getAngsuranAktifByIdPeminjaman(idPinjaman, angsuran.id);
            if (!angsuranTerakhir && statusPinjaman != "lunas") {
                const tanggalPembayaran = new Date(lastAngsuran.tanggal_pembayaran);
                let isAktifAdded = false;
                while (!isAktifAdded) {
                    tanggalPembayaran.setDate(tanggalPembayaran.getDate() + 7);
                    const isDay = await isHoliday(tanggalPembayaran);

                    if (isDay) {
                        await Angsuran.createAngsuran({
                            idPinjaman: angsuran.id_pinjaman,
                            tanggalPembayaran: formatDate(tanggalPembayaran),
                            status: "libur"
                        });
                    } else {
                        await Angsuran.createAngsuran({
                            idPinjaman: angsuran.id_pinjaman,
                            tanggalPembayaran: formatDate(tanggalPembayaran),
                            status: "aktif"
                        });
                        isAktifAdded = true;
                    }
                }
            }

            for (const p of penagih) {
                await Angsuran.createPenagihAngsuran({ id_karyawan: p, id_angsuran: angsuran_id });
            }
            await trx.commit();
            res.status(200).json({
                angsuran,
            });
        } catch (error) {
            await trx.rollback();
            res.status(500).json({ error: error.message });
        }
    }



    static async update(req, res) {
        await body('penagih').isArray({ min: 1 }).run(req);
        await body('status')
            .notEmpty()
            .run(req);

        await body('asal_pembayaran')
            .custom((value, { req }) => {
                if (req.body.status === 'lunas' && (value != 'anggota' && value != 'penagih' && value != 'katrol')) {
                    throw new Error('Jika status lunas, asal pembayaran harus anggota');
                }
                return true;
            })
            .run(req);


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, e) => {
                acc[e.path] = e.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }
        const trx = await db.transaction();
        try {


            const { id } = req.params
            const { penagih, asal_pembayaran, jumlah_bayar, jumlah_katrol } = req.body
            const angsuran = await Angsuran.findById(id);
            if (!angsuran) {
                res.status(404).json({ error: "Angsuran tidak ditemukan" });
            }




            await Angsuran.updateAngsuran(id, {
                asal_pembayaran,
                jumlah_bayar,
                jumlah_katrol
            });
            await Angsuran.deletePenagihAngsuranByIdAngsuran(id)
            for (const p of penagih) {
                await Angsuran.createPenagihAngsuran({ id_karyawan: p, id_angsuran: id });
            }
            await Angsuran.updateSisaPembayaran(angsuran.id_pinjaman);


            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            const lastAngsuran = await Angsuran.getLastAngsuran(angsuran.id_pinjaman);
            const tanggalPembayaran = new Date(lastAngsuran.tanggal_pembayaran);
            let isAktifAdded = false;
            while (!isAktifAdded) {
                tanggalPembayaran.setDate(tanggalPembayaran.getDate() + 7);
                const isDay = await isHoliday(tanggalPembayaran);
                if (isDay) {
                    await Angsuran.createAngsuran({
                        idPinjaman: angsuran.id_pinjaman,
                        tanggalPembayaran: formatDate(tanggalPembayaran),
                        status: "libur"
                    });
                } else {
                    await Angsuran.createAngsuran({
                        idPinjaman: angsuran.id_pinjaman,
                        tanggalPembayaran: formatDate(tanggalPembayaran),
                        status: "aktif"
                    });
                    isAktifAdded = true;
                }
            }


            await trx.commit();
            res.status(200).json({
                angsuran,

            });
        } catch (error) {
            await trx.rollback();
            res.status(500).json({ error: error.message });
        }
    }

    static async lastAngsuran(req, res) {
        try {
            const { id } = req.params;
            const angsuran = await Angsuran.getAngsuranAktifByIdPeminjaman(id);
            res.json({
                angsuran
            })

        } catch (error) {
            res.json({ error })
        }
    }
}
