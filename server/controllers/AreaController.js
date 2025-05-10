import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from "../config/db.js";

export default class AreaController {
  // Menampilkan daftar area dengan pagination
  static async index(req, res) {
    try {
      const { page = 1, limit = 10 ,search = ""} = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const [areas] = await db.query(
        `SELECT * FROM areas   WHERE deleted_at is null AND area_name like ? ORDER BY id  DESC LIMIT ? OFFSET ?`,
        [`%${search}%`,parseInt(limit), offset]
      );

      const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM areas WHERE deleted_at is null AND area_name like ? ',[`%${search}%`]);

      res.status(200).json({
        areas,
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
  static async count(req, res) {
    try {
      const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM areas WHERE deleted_at is null ');
      res.status(200).json({
        total,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Menampilkan detail area berdasarkan ID
  static async show(req, res) {
    try {
      const { id } = req.params;
      const [area] = await db.query(
        'SELECT * FROM areas WHERE id = ?',
        [id]
      );
      if (!area || area.length === 0) {
        return res.status(404).json({ error: 'Area tidak ditemukan' });
      }
      res.status(200).json({
        area: area[0],
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while retrieving the area.' });
    }
  }

  // Menyimpan area baru dengan validasi dan enkripsi password
  static async store(req, res) {
    // Validasi input menggunakan express-validator
    await body('area_name').notEmpty().withMessage('Nama Area wajib diisi').run(req);
    await body('city').notEmpty().withMessage('Kota wajib diisi').run(req);
    await body('subdistrict').notEmpty().withMessage('Kecamatan wajib diisi').run(req);
    await body('village').notEmpty().withMessage('Desa wajib diisi').run(req);
    await body('address').notEmpty().withMessage('Alamat wajib diisi').run(req);
    await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status must be active or inactive').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg; // key = field name, value = error message
            return acc;
        }, {});

      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { area_name, city, subdistrict, village, address, status } = req.body;

      // Cek apakah area sudah ada di database
      const [existingArea] = await db.query('SELECT * FROM areas WHERE area_name = ?', [area_name]);
      if (existingArea.length > 0) {
        return res.status(400).json({ errors: { area_name: 'Nama area sudah ada' } });
      }


      // Insert data area baru ke database
      const result = await db.query(
        'INSERT INTO areas (area_name, city, subdistrict, village, address, status) VALUES (?, ?, ?, ?, ?, ?)',
        [area_name, city, subdistrict, village, address, status]
      );

      // Ambil data area yang baru saja dimasukkan
      const newArea = await db.query('SELECT * FROM areas WHERE id = ?', [result.insertId]);

      res.status(201).json({
        message: 'Area berhasil dibuat',
        area: newArea[0], // Mengembalikan data area yang baru saja dibuat
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the area.' + error.message });
    }
  }

  // Mengupdate data area dengan pengecekan dan enkripsi password jika ada perubahan
  static async update(req, res) {
    // Validasi input menggunakan express-validator
    await body('area_name').notEmpty().withMessage('Nama Area wajib diisi').run(req);
    await body('city').notEmpty().withMessage('Kota wajib diisi').run(req);
    await body('subdistrict').notEmpty().withMessage('Kecamatan wajib diisi').run(req);
    await body('village').notEmpty().withMessage('Desa wajib diisi').run(req);
    await body('address').notEmpty().withMessage('Alamat wajib diisi').run(req);
    await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status must be active or inactive').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg; // key = field name, value = error message
            return acc;
        }, {});

      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { id } = req.params;
      const { area_name, city, subdistrict, village, address, status } = req.body;

      const [existingArea] = await db.query('SELECT * FROM areas WHERE id = ?', [id]);
      if (!existingArea || existingArea.length === 0) {
        return res.status(404).json({ error: 'Area tidak ditemukan' });
      }

      const [areaByAreaName] = await db.query('SELECT * FROM areas WHERE area_name = ? AND id <> ?', [area_name, id]);
      if (areaByAreaName.length > 0) {
        return res.status(400).json({ errors: { area_name: 'Nama area sudah terdaftar' } });
      }

      // Jika password diberikan, enkripsi password sebelum update
      let updateData = [area_name, city, subdistrict, village, address, status, id];

      await db.query(
        `UPDATE areas SET area_name = ?, city = ?, subdistrict = ?, village = ?, address = ?, status = ?  WHERE id = ?`,
        updateData
      );

      res.status(201).json({ message: 'Area updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the area.' });
    }
  }


    // Menampilkan detail area berdasarkan ID
    static async delete(req, res) {
        try {
          const { id } = req.params;
          const [area] = await db.query(
            'SELECT * FROM areas WHERE id = ?',
            [id]
          );
          if (!area || area.length === 0) {
            return res.status(404).json({ error: 'Area tidak ditemukan' });
          }

          await db.query(
            `UPDATE areas SET deleted_at = ? WHERE id = ${id}`,
            new Date()
          );
          res.status(200).json({
            area: area[0],
          });
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while retrieving the area.' });
        }
      }
}
