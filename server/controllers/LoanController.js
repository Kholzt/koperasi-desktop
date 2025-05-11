import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from "../config/db.js";

export default class LoanController {
    // Menampilkan daftar area dengan pagination
    static async index(req, res) {
        try {
            const { page = 1, limit = 10, search = "" } = req.query;

            const offset = (parseInt(page) - 1) * parseInt(limit);
            const [loans] = await db.query(
                `SELECT pinjaman.*,JSON_OBJECT('complete_name', members.complete_name) as anggota FROM pinjaman JOIN members ON pinjaman.anggota_id = members.id WHERE pinjaman.deleted_at is null ORDER BY pinjaman.id  DESC LIMIT ? OFFSET ?`,
                [parseInt(limit), offset]
            );

            const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM pinjaman WHERE deleted_at is null');

            res.status(200).json({
                loans,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / limit),
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
            const [rows] = await db.query(
                `SELECT
            pinjaman.*,
            members.complete_name AS anggota_nama,
            pj.complete_name AS pj_nama,
            pit.complete_name AS pit_nama,
            angsuran.jumlah_bayar,
            angsuran.tanggal_pembayaran
         FROM pinjaman
         JOIN members ON pinjaman.anggota_id = members.id
         JOIN users AS pj ON pinjaman.penanggung_jawab = pj.id
         JOIN users AS pit ON pinjaman.petugas_input = pit.id
         LEFT JOIN angsuran ON pinjaman.id = angsuran.id_pinjaman
         WHERE pinjaman.deleted_at IS NULL AND pinjaman.id = ?
         ORDER BY pinjaman.id
        `,
                [id]
            );

            const map = new Map();

            for (const row of rows) {
                if (!map.has(row.id)) {
                    map.set(row.id, {
                        ...row,
                        anggota: {
                            complete_name: row.anggota_nama,
                        },
                        penanggungJawab: {
                            complete_name: row.pj_nama,
                        },
                        petugas: {
                            complete_name: row.pit_nama,
                        },
                        angsuran: [],
                    });
                }

                // Tambahkan data angsuran ke array jika ada
                const pinjaman = map.get(row.id);
                pinjaman.angsuran.push({
                    jumlah_bayar: row.jumlah_bayar,
                    tanggal_pembayaran: row.tanggal_pembayaran,
                });
            }

            const loan = Array.from(map.values())
            res.status(200).json({
                loan: loan[0],
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the area.' });
        }
    }

    static async getCode(req, res) {
        try {
            const { id } = req.params;
            const [rows] = await db.query(
                `SELECT * FROM pinjaman WHERE  anggota_id = ? `,
                [id]
            );
            const [member] = await db.query(
                `SELECT sequence_number FROM members WHERE id = ? `,
                [id]
            );

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

            let result = "";
            for (const [letter, value] of roman) {
                while (num >= value) {
                    result += letter;
                    num -= value;
                }
            }
            const romanLength = result;
            const code = `${romanLength}/${member[0].sequence_number}`;
            res.status(200).json({
                code,
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the area.' + error.message });
        }
    }




    // Menyimpan area baru dengan validasi dan enkripsi password
    static async store(req, res) {
        // Validasi input menggunakan express-validator
        await body('kode').notEmpty().withMessage('Kode wajib diisi').run(req)
        await body('jumlah_pinjaman').notEmpty().withMessage('Jumlah pinjaman wajib diisi').isFloat({ min: 0 }).withMessage('Jumlah pinjaman harus berupa angka dan minimal 0').run(req)
        await body('total_pinjaman_diterima').notEmpty().withMessage('Total pinjaman diterima wajib diisi').isFloat({ min: 0 }).withMessage('Total pinjaman diterima harus berupa angka dan minimal 0').run(req)
        await body('persen_bunga').notEmpty().withMessage('Persen bunga wajib diisi').isFloat({ min: 0, max: 100 }).withMessage('Persen bunga harus berupa angka antara 0 hingga 100').run(req)
        await body('total_bunga').notEmpty().withMessage('Total bunga bunga wajib diisi').run(req)
        await body('anggota_id').notEmpty().withMessage('Anggota wajib dipilih').run(req)
        await body('total_pinjaman').notEmpty().withMessage('Total pinjaman wajib diisi').run(req)
        await body('jumlah_angsuran').notEmpty().withMessage('Jumlah angsuran wajib diisi').isNumeric().withMessage('Jumlah angsuran harus berupa angka').run(req)
        await body('modal_do').notEmpty().withMessage('Modal DO wajib diisi').isFloat({ min: 0 }).withMessage('Modal DO harus berupa angka dan minimal 0').run(req)
        await body('penanggung_jawab').notEmpty().withMessage('Penanggung jawab wajib dipilih').run(req)
        await body('petugas_input').notEmpty().withMessage('Petugas input wajib dipilih').run(req)
        await body('status')
            .notEmpty().withMessage('Status wajib dipilih').isIn(['aktif', 'lunas', 'menunggak']).withMessage('Status harus salah satu dari: aktif, lunas, atau menunggak').run(req)

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg; // key = field name, value = error message
                return acc;
            }, {});

            return res.status(400).json({ errors: formattedErrors });
        }

        try {
            const { jumlah_pinjaman, total_pinjaman_diterima,anggota_id, kode ,penanggung_jawab,modal_do,jumlah_angsuran,total_pinjaman,persen_bunga,status,petugas_input,total_bunga } = req.body;

            // Cek apakah area sudah ada di database
            const [existingArea] = await db.query('SELECT * FROM pinjaman WHERE kode = ?', [kode]);
            if (existingArea.length > 0) {
                return res.status(400).json({ errors: { kode: 'Kode sudah ada' } });
            }


            // Insert data area baru ke database
            const result = await db.query(
                'INSERT INTO pinjaman (jumlah_pinjaman, total_pinjaman_diterima,anggota_id, kode ,penanggung_jawab,modal_do,jumlah_angsuran,total_pinjaman,persen_bunga,status,petugas_input,sisa_pembayaran,besar_tunggakan,total_bunga ) VALUES ( ?, ?, ?, ?, ?,?,?,?,?,?,?,?,?,?)',
                [jumlah_pinjaman, total_pinjaman_diterima,anggota_id, kode ,penanggung_jawab,modal_do,jumlah_angsuran,total_pinjaman,persen_bunga,status,petugas_input,0,0,total_bunga ]
            );

            // Ambil data area yang baru saja dimasukkan
            const newPeminjaman = await db.query('SELECT * FROM pinjaman WHERE id = ?', [result.insertId]);

            res.status(201).json({
                message: 'Area berhasil dibuat',
                pinjaman: newPeminjaman[0], // Mengembalikan data area yang baru saja dibuat
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while creating the area.' + error.message });
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

    try {
        const id = req.params.id; // pastikan id dikirim di URL: /pinjaman/:id
        const {
            jumlah_pinjaman, total_pinjaman_diterima, anggota_id, kode,
            penanggung_jawab, modal_do, jumlah_angsuran, total_pinjaman,
            persen_bunga, status, petugas_input, total_bunga
        } = req.body;

        // Cek apakah pinjaman dengan ID tersebut ada
        const [existing] = await db.query('SELECT * FROM pinjaman WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Data pinjaman tidak ditemukan.' });
        }

        // Cek kode unik (kode tidak boleh sama dengan entri lain)
        const [kodeCek] = await db.query('SELECT * FROM pinjaman WHERE kode = ? AND id != ?', [kode, id]);
        if (kodeCek.length > 0) {
            return res.status(400).json({ errors: { kode: 'Kode sudah digunakan oleh pinjaman lain.' } });
        }

        // Update data
        await db.query(
            `UPDATE pinjaman SET
                jumlah_pinjaman = ?,
                total_pinjaman_diterima = ?,
                penanggung_jawab = ?,
                modal_do = ?,
                jumlah_angsuran = ?,
                total_pinjaman = ?,
                persen_bunga = ?,
                status = ?,
                petugas_input = ?,
                total_bunga = ?
             WHERE id = ?`,
            [
                jumlah_pinjaman, total_pinjaman_diterima,
                penanggung_jawab, modal_do, jumlah_angsuran, total_pinjaman,
                persen_bunga, status, petugas_input, total_bunga, id
            ]
        );

        const [updatedPinjaman] = await db.query('SELECT * FROM pinjaman WHERE id = ?', [id]);

        res.status(200).json({
            message: 'Data pinjaman berhasil diperbarui',
            pinjaman: updatedPinjaman[0],
        });

    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan saat memperbarui data: ' + error.message });
    }
}



    // Menampilkan detail area berdasarkan ID
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const [pinjaman] = await db.query(
                'SELECT * FROM  pinjaman WHERE id = ?',
                [id]
            );
            if (!pinjaman || pinjaman.length === 0) {
                return res.status(404).json({ error: 'Area tidak ditemukan' });
            }

            await db.query(
                `UPDATE pinjaman SET deleted_at = ? WHERE id = ${id}`,
                new Date()
            );
            res.status(200).json({
                pinjaman: pinjaman[0],
            });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while retrieving the pinjaman.' ,errorss:error});
        }
    }
}
