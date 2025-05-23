import bcrypt from 'bcryptjs';
import User from '../models/User.js';

export default class AuthController {
  static async login(req, res) {
    try {
      const { username, password } = req.body;
      const user = await User.findByUsername(username);

      if (!user) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
      }

      return res.json({ message: 'Berhasil login', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  static async getUser(req, res) {
    try {
      const { id } = req.query;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
      }

      res.json({ message: 'Pengguna berhasil didapatkan', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}
