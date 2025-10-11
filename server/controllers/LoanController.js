import { body, validationResult } from 'express-validator';
import db from "../config/db.js";
import Loan from '../models/Loan.js';
import { isHoliday } from '../config/holidays.js';

export default class LoanController {
    // Menampilkan daftar area dengan pagination
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, startDate = null, endDate = new Date(), status = null, day = "all", group = "all", search = null
            } = req.query;
            const pageInt = parseInt(page);
            const limitInt = parseInt(limit);
            const offset = (pageInt - 1) * limitInt;
            
            // Query loans with join to members
            const { loans, total } = await Loan.findAll({ limit, offset, startDate, endDate, status, day, group, search })

            // Total count


            res.status(200).json({
                loans,
                pagination: {
                    total: Number(total),
                    page: pageInt,
                    limit: limitInt,
                    totalPages: Math.ceil(total / limitInt),
                },
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }


    // Menampilkan detail area berdasarkan ID
    static async show(req, res) {
        try {
            const { id } = req.params;
            const rows = await Loan.findById(id);

            const map = new Map();
            const hasAngsuran = await Loan.checkStatusAngsuran(id)
            for (const row of rows) {
                const penanggungJawab = await Loan.findPenanggungJawab(row.penanggung_jawab)
                if (!map.has(row.id)) {
                    map.set(row.id, {
                        ...row,
                        anggota: { complete_name: row.anggota_nama },
                        penanggungJawab: penanggungJawab,
                        hasAngsuran: hasAngsuran > 0,
                        petugas: { complete_name: row.pit_nama },
                        pos: { nama_pos: row.nama_pos },
                        angsuran: new Map(), // gunakan Map untuk menghindari duplikat
                    });
                }

                const pinjaman = map.get(row.id);
                const angsuranMap = pinjaman.angsuran;

                if (!angsuranMap.has(row.id_angsuran)) {
                    angsuranMap.set(row.id_angsuran, {
                        id: row.id_angsuran,
                        jumlah_bayar: row.jumlah_bayar,
                        jumlah_katrol: row.jumlah_katrol,
                        asal_pembayaran: row.asal_pembayaran,
                        status: row.status_angsuran,
                        tanggal_pembayaran: row.tanggal_pembayaran,
                        penagih: row.penagih_nama
                            ? [{ complete_name: row.penagih_nama }]
                            : [],
                    });
                } else {
                    // Jika sudah ada angsuran, tambahkan penagih jika belum ada
                    const existingAngsuran = angsuranMap.get(row.id_angsuran);

                    if (
                        row.penagih_nama &&
                        !existingAngsuran.penagih.some(p => p.complete_name === row.penagih_nama)
                    ) {
                        existingAngsuran.penagih.push({ complete_name: row.penagih_nama });
                    }
                }

            }

            // Ubah Map angsuran menjadi array sebelum dikirim
            const loan = Array.from(map.values())[0];
            loan.angsuran = Array.from(loan.angsuran.values());

            res.status(200).json({ loan });
        } catch (error) {
            res.status(500).json({
                error: 'An error occurred while retrieving the loan.',
                errors: error,
            });
        }
    }



    static async getCode(req, res) {
        try {
            const { id } = req.params;
            const rows = await db("pinjaman").where("anggota_id", id).whereNull("deleted_at");
            const member = await db("members").select("sequence_number").where("id", id).first();
            console.log(rows);
            let num = rows.length + 1;
            const roman = [
                ["M", 1000],
                ["CM", 900],
                ["D", 500],
                ["CD", 400],
                ["C", 100],
                ["XC", 90],
                ["L", 50],
                ["XL", 40],
                ["X", 10],
                ["IX", 9],
                ["V", 5],
                ["IV", 4],
                ["I", 1]
            ];

            // let result = "";
            // let romanVal = member.sequence_number;
            // for (const [letter, value] of roman) {
            //     while (romanVal >= value) {
            //         result += letter;
            //         romanVal -= value;
            //     }
            // }
            // const romanLength = result;
            // const code = `${romanLength}/${num}`;
            let result = "";
            // let romanVal = member.sequence_number;
            for (const [letter, value] of roman) {
                while (num >= value) {
                    result += letter;
                    num -= value;
                }
            }
            const romanLength = result;
            const code = `${romanLength}/${member.sequence_number}`;
            res.status(200).json({
                code, rows, member, num, result
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the area.' + error.message });
        }
    }




    static async store(req, res) {
        // Validasi input menggunakan express-validator
        await body('kode').notEmpty().withMessage('Kode wajib diisi').run(req);
        await body('jumlah_pinjaman').notEmpty().withMessage('Jumlah pinjaman wajib diisi').isFloat({ min: 0 }).run(req);
        await body('total_pinjaman_diterima').notEmpty().withMessage('Total pinjaman diterima wajib diisi').isFloat({ min: 0 }).run(req);
        await body('persen_bunga').notEmpty().withMessage('Persen bunga wajib diisi').isFloat({ min: 0, max: 100 }).run(req);
        await body('total_bunga').notEmpty().withMessage('Total bunga wajib diisi').run(req);
        await body('anggota_id').notEmpty().withMessage('Anggota wajib dipilih').run(req);
        await body('total_pinjaman').notEmpty().withMessage('Total pinjaman wajib diisi').run(req);
        await body('jumlah_angsuran').notEmpty().withMessage('Jumlah angsuran wajib diisi').isNumeric().run(req);
        await body('modal_do').notEmpty().withMessage('Modal DO wajib diisi').isFloat({ min: 0 }).run(req);
        await body('penanggung_jawab').notEmpty().withMessage('Penanggung jawab wajib dipilih').run(req);
        await body('petugas_input').notEmpty().withMessage('Petugas input wajib dipilih').run(req);
        await body('status').notEmpty().withMessage('Status wajib dipilih').isIn(['aktif', 'lunas', 'menunggak']).run(req);
        await body('tanggal_pinjam').notEmpty().withMessage('Tanggal input wajib dipilih').run(req)


        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }
        const trx = await db.transaction();

        try {
            const {
                jumlah_pinjaman,
                total_pinjaman_diterima,
                anggota_id,
                kode,
                penanggung_jawab,
                modal_do,
                jumlah_angsuran,
                total_pinjaman,
                persen_bunga,
                status,
                petugas_input,
                total_bunga,
                tanggal_pinjam
            } = req.body;

            const loanExist = await Loan.existLoan(anggota_id, kode);
            if (loanExist) {
                return res.status(400).json({ errors: { kode: 'Kode sudah ada' } });
            }

            // Hitung tanggal angsuran pertama (7 hari dari sekarang)
            const now = new Date();
            const tanggalAngsuranPertama = new Date(tanggal_pinjam);
            tanggalAngsuranPertama.setDate(tanggalAngsuranPertama.getDate() + 7);

            // Fungsi format tanggal YYYY-MM-DD
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            // Simpan data pinjaman
            const loanId = await Loan.create({
                jumlah_pinjaman,
                total_pinjaman_diterima,
                anggota_id,
                kode,
                penanggung_jawab: JSON.stringify(penanggung_jawab),
                modal_do,
                jumlah_angsuran,
                total_pinjaman,
                persen_bunga,
                status,
                petugas_input,
                sisa_pembayaran: total_pinjaman,
                besar_tunggakan: 0,
                total_bunga,
                tanggal_angsuran_pertama: formatDate(tanggalAngsuranPertama),
                created_at: now,
            });

            // Loop angsuran per bulan
            let totalMinggu = parseInt(process.env.VITE_APP_BULAN || '10');
            for (let i = 0; i < totalMinggu; i++) {
                const tanggalPembayaran = new Date(tanggalAngsuranPertama);
                tanggalPembayaran.setDate(tanggalPembayaran.getDate() + (i * 7));

                let sudahAktif = false;

                while (!sudahAktif) {
                    const isDay = await isHoliday(tanggalPembayaran);
                    if (isDay) {
                        // Buat angsuran status "libur"
                        await Loan.createAngsuran({
                            idPinjaman: loanId,
                            tanggalPembayaran: formatDate(tanggalPembayaran),
                            status: "libur"
                        });

                        // Geser ke minggu berikutnya
                        tanggalPembayaran.setDate(tanggalPembayaran.getDate() + 7);
                        i++;
                        totalMinggu++;
                    } else {
                        sudahAktif = true;
                        await Loan.createAngsuran({
                            idPinjaman: loanId,
                            tanggalPembayaran: formatDate(tanggalPembayaran),
                            status: "aktif"
                        });
                    }
                }
            }



            const newPeminjaman = await Loan.findById(loanId);
            await trx.commit();

            res.status(200).json({
                message: 'Pinjaman berhasil dibuat',
                pinjaman: newPeminjaman
            });

        } catch (error) {
            await trx.rollback();

            res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan pinjaman: ' + error.message });
        }
    }


    // Mengupdate data area dengan pengecekan dan enkripsi password jika ada perubahan
    static async update(req, res) {
        // Validasi input menggunakan express-validator
        await body('jumlah_pinjaman').notEmpty().withMessage('Jumlah pinjaman wajib diisi').isFloat({ min: 0 }).withMessage('Jumlah pinjaman harus berupa angka dan minimal 0').run(req)
        await body('total_pinjaman_diterima').notEmpty().withMessage('Total pinjaman diterima wajib diisi').isFloat({ min: 0 }).withMessage('Total pinjaman diterima harus berupa angka dan minimal 0').run(req)
        await body('persen_bunga').notEmpty().withMessage('Persen bunga wajib diisi').isFloat({ min: 0, max: 100 }).withMessage('Persen bunga harus berupa angka antara 0 hingga 100').run(req)
        await body('total_bunga').notEmpty().withMessage('Total bunga wajib diisi').run(req)
        await body('total_pinjaman').notEmpty().withMessage('Total pinjaman wajib diisi').run(req)
        await body('jumlah_angsuran').notEmpty().withMessage('Jumlah angsuran wajib diisi').isNumeric().withMessage('Jumlah angsuran harus berupa angka').run(req)
        await body('modal_do').notEmpty().withMessage('Modal DO wajib diisi').isFloat({ min: 0 }).withMessage('Modal DO harus berupa angka dan minimal 0').run(req)
        await body('penanggung_jawab').notEmpty().withMessage('Penanggung jawab wajib dipilih').run(req)
        await body('petugas_input').notEmpty().withMessage('Petugas input wajib dipilih').run(req)
        await body('status')
            .notEmpty().withMessage('Status wajib dipilih')
            .isIn(['aktif', 'lunas', 'menunggak']).withMessage('Status harus salah satu dari: aktif, lunas, atau menunggak').run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});
            return res.status(400).json({ errors: formattedErrors });
        }

        const trx = await db.transaction();
        try {
            const id = req.params.id; // pastikan id dikirim di URL: /pinjaman/:id
            const {
                jumlah_pinjaman, total_pinjaman_diterima, anggota_id, kode,
                penanggung_jawab, modal_do, jumlah_angsuran, total_pinjaman,
                persen_bunga, status, petugas_input, total_bunga
            } = req.body;

            // Cek apakah pinjaman dengan ID tersebut ada
            const existing = await Loan.findById(id);
            if (!existing) {
                return res.status(404).json({ error: 'Data pinjaman tidak ditemukan.' });
            }

            // Cek kode unik (kode tidak boleh sama dengan entri lain)
            const kodeCek = await Loan.existLoan(anggota_id, kode, id);
            if (kodeCek) {
                return res.status(400).json({ errors: { kode: 'Kode sudah digunakan oleh pinjaman lain.' } });
            }

            const data = {
                jumlah_pinjaman,
                total_pinjaman_diterima,
                penanggung_jawab: JSON.stringify(penanggung_jawab),
                modal_do,
                jumlah_angsuran,
                total_pinjaman,
                persen_bunga,
                status,
                petugas_input,
                total_bunga,
                // sisa_pembayaran: total_pinjaman
            };
            // Update data
            await Loan.update(data, id)
            await Loan.updateSisaPembayaran(id);

            const updatedPinjaman = await Loan.findById(id);
            await trx.commit();

            res.status(200).json({
                message: 'Data pinjaman berhasil diperbarui',
                pinjaman: updatedPinjaman,
            });

        } catch (error) {
            await trx.rollback();

            res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui data: ' + error.message });
        }
    }



    // Menampilkan detail area berdasarkan ID
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const pinjaman = await Loan.findByIdOnlyOne(id);
            if (!pinjaman) {
                return res.status(404).json({ error: 'Pinjaman tidak ditemukan' });
            }

            // const isUsed = pinjaman.total_pinjaman > pinjaman.sisa_pembayaran || pinjaman.besar_tunggakan > 0;
            // if (isUsed) {
            //     return res.status(409).json({
            //         error: 'Pinjaman gagal dihapus, Data sedang digunakan dibagian lain sistem',
            //     });
            // }
            await Loan.softDelete(id);
            res.status(200).json({
                pinjaman: pinjaman,
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the pinjaman.', errorss: error });
        }
    }


    static async pinjamanAnggotaStatus(req, res) {
        try {
            const { id } = req.params;
            const pinjaman = await Loan.checkStatusPinjamanAnggota(id);

            res.status(200).json({
                punyaTunggakan: pinjaman > 0,
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the pinjaman.', errorss: error });
        }
    }
}
