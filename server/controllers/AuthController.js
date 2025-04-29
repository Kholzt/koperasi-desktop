import db from "../config/db.js";
import bcrypt from 'bcryptjs';

export default class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND access_apps = ? AND deleted_at is null AND status = ?', [username,"access","aktif"]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
      }

      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password);
      if(!valid){
        return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }
    return   res.json({ message: 'Berhasil login', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  static async getUser(req, res) {
    try {
      const { id } = req.query;
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
      }

      const user = rows[0];
    //   const valid = await bcrypt.compare(password, user.password);

    //

      res.json({ message: 'Pengguna berhasil didapatkan', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
