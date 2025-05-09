import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from "../config/db.js";

export default class UserController {
  // Menampilkan daftar pengguna dengan pagination
  static async index(req, res) {
    try {
      const { page = 1, limit = 10 ,search = ""} = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const [users] = await db.query(
        `SELECT * FROM users   WHERE deleted_at is null AND complete_name like ?  AND access_apps = ? ORDER BY id DESC LIMIT ? OFFSET ?`,
        [`%${search}%`,"access",parseInt(limit), offset]
      );

      const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM users WHERE deleted_at is null AND complete_name like ? AND access_apps = ?',[`%${search}%`,"access"]);

      res.status(200).json({
        users,
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

  // Menampilkan detail pengguna berdasarkan ID
  static async show(req, res) {
    try {
      const { id } = req.params;
      const [user] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      if (!user || user.length === 0) {
        return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      }
      res.status(200).json({
        user: user[0],
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while retrieving the user.' });
    }
  }

  // Menyimpan pengguna baru dengan validasi dan enkripsi password
  static async store(req, res) {
    // Validasi input menggunakan express-validator
    await body('username').notEmpty().withMessage('Username is required').run(req);
    await body('complete_name').notEmpty().withMessage('Complete name is required').run(req);
    await body('role').notEmpty().withMessage('Role is required').run(req);
    // await body('access_apps').notEmpty().withMessage('Access apps is required').run(req);
    // await body('position').notEmpty().withMessage('Position is required').run(req);
    await body('status').isIn(['aktif', 'nonAktif']).withMessage('Status must be active or inactive').run(req);
    await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().reduce((acc, error) => {
            acc[error.param] = error.msg; // key = field name, value = error message
            return acc;
        }, {});

      return res.status(400).json({ errors: formattedErrors });
    }

    try {
      const { username, complete_name, role, access_apps, position, status, password } = req.body;

      // Cek apakah username sudah ada di database
      const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      if (existingUser.length > 0) {
        return res.status(400).json({ errors: { username: 'Username sudah terdaftar' } });
      }

      // Enkripsi password sebelum menyimpannya
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert data pengguna baru ke database
      const result = await db.query(
        'INSERT INTO users (username, complete_name, role, access_apps, position, status, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [username, complete_name, role, "access", position, status, hashedPassword]
      );

      // Ambil data pengguna yang baru saja dimasukkan
      const newUser = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);

      res.status(201).json({
        message: 'Pengguna berhasil dibuat',
        user: newUser[0], // Mengembalikan data pengguna yang baru saja dibuat
      });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while creating the user.' });
    }
  }

  // Mengupdate data pengguna dengan pengecekan dan enkripsi password jika ada perubahan
  static async update(req, res) {
    // Validasi input menggunakan express-validator
    await body('username').notEmpty().withMessage('Username is required').run(req);
    await body('complete_name').notEmpty().withMessage('Complete name is required').run(req);
    await body('role').notEmpty().withMessage('Role is required').run(req);
    // await body('access_apps').notEmpty().withMessage('Access apps is required').run(req);
    // await body('position').notEmpty().withMessage('Position is required').run(req);
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
      const { username, complete_name, role, access_apps, position, status } = req.body;

      const [existingUser] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      if (!existingUser || existingUser.length === 0) {
        return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
      }

      const [userByUsername] = await db.query('SELECT * FROM users WHERE username = ? AND id <> ?', [username, id]);
      if (userByUsername.length > 0) {
        return res.status(400).json({ errors: { username: 'Username sudah terdaftar' } });
      }

      // Jika password diberikan, enkripsi password sebelum update
      let updateData = [username, complete_name, role, "access", position, status, id];

      await db.query(
        `UPDATE users SET username = ?, complete_name = ?, role = ?, access_apps = ?, position = ?, status = ?  WHERE id = ?`,
        updateData
      );

      res.status(201).json({ message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while updating the user.' });
    }
  }


    // Menampilkan detail pengguna berdasarkan ID
    static async delete(req, res) {
        try {
          const { id } = req.params;
          const [user] = await db.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
          );
          if (!user || user.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
          }

          await db.query(
            `UPDATE users SET deleted_at = ? WHERE id = ${id}`,
            new Date()
          );
          res.status(200).json({
            user: user[0],
          });
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while retrieving the user.' });
        }
      }
}
