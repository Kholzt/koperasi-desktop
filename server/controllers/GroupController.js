import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from "../config/db.js";

export default class GroupController {
  // Menampilkan daftar group dengan pagination
  static async index(req, res) {
    try {
      const { page = 1, limit = 10 ,search = ""} = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const [groups] = await db.query(
        `SELECT * FROM groups   WHERE deleted_at is null AND group_name like ? ORDER BY id  DESC LIMIT ? OFFSET ?`,
        [`%${search}%`,parseInt(limit), offset]
      );

      const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM groups WHERE deleted_at is null AND group_name like ? ',[`%${search}%`]);

      res.status(200).json({
        groups,
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

  // Menampilkan detail group berdasarkan ID
  static async show(req, res) {
    try {
      const { id } = req.params;
      const [group] = await db.query(
        'SELECT * FROM groups WHERE id = ?',
        [id]
      );
      if (!group || group.length === 0) {
        return res.status(404).json({ error: 'Group tidak ditemukan' });
      }
      res.status(200).json({
        group: group[0],
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while retrieving the group.' });
    }
  }

  // Menyimpan group baru dengan validasi dan enkripsi password
  static async store(req, res) {
    // Validasi input menggunakan express-validator
    await body('group_name').notEmpty().withMessage('Nama Group wajib diisi').run(req);
    await body('area_id').notEmpty().withMessage('Area wajib diisi').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg; // key = field name, value = error message
            return acc;
        }, {});

      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { group_name, area_id } = req.body;

      // Cek apakah group sudah ada di database
      const [existingGroup] = await db.query('SELECT * FROM groups WHERE group_name = ?', [group_name]);
      if (existingGroup.length > 0) {
        return res.status(400).json({ errors: { group_name: 'Nama group sudah ada' } });
      }


      // Insert data group baru ke database
      const result = await db.query(
        'INSERT INTO groups (group_name, area_id) VALUES (?, ?, ?, ?, ?, ?)',
        [group_name, area_id]
      );

      // Ambil data group yang baru saja dimasukkan
      const newGroup = await db.query('SELECT * FROM groups WHERE id = ?', [result.insertId]);

      res.status(201).json({
        message: 'Group berhasil dibuat',
        group: newGroup[0], // Mengembalikan data group yang baru saja dibuat
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the group.' + error.message });
    }
  }

  // Mengupdate data group dengan pengecekan dan enkripsi password jika ada perubahan
  static async update(req, res) {
    // Validasi input menggunakan express-validator
    await body('group_name').notEmpty().withMessage('Nama Group wajib diisi').run(req);
    await body('area_id').notEmpty().withMessage('Area wajib diisi').run(req);


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
      const { group_name, city, subdistrict, village, address, status } = req.body;

      const [existingGroup] = await db.query('SELECT * FROM groups WHERE id = ?', [id]);
      if (!existingGroup || existingGroup.length === 0) {
        return res.status(404).json({ error: 'Group tidak ditemukan' });
      }

      const [groupByGroupName] = await db.query('SELECT * FROM groups WHERE group_name = ? AND id <> ?', [group_name, id]);
      if (groupByGroupName.length > 0) {
        return res.status(400).json({ errors: { group_name: 'Nama group sudah terdaftar' } });
      }

      // Jika password diberikan, enkripsi password sebelum update
      let updateData = [group_name, area_id, id];

      await db.query(
        `UPDATE groups SET group_name = ?, area_id = ?  WHERE id = ?`,
        updateData
      );

      res.status(201).json({ message: 'Group updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the group.' });
    }
  }


    // Menampilkan detail group berdasarkan ID
    static async delete(req, res) {
        try {
          const { id } = req.params;
          const [group] = await db.query(
            'SELECT * FROM groups WHERE id = ?',
            [id]
          );
          if (!group || group.length === 0) {
            return res.status(404).json({ error: 'Group tidak ditemukan' });
          }

          await db.query(
            `UPDATE groups SET deleted_at = ? WHERE id = ${id}`,
            new Date()
          );
          res.status(200).json({
            group: group[0],
          });
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while retrieving the group.' });
        }
      }
}
