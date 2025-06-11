import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

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
            res.status(500).json({ message: 'Server error', error });
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


    static async updateUserProfil(req, res) {
        await body('username').notEmpty().withMessage('Username wajib diisi').run(req);
        await body('complete_name').notEmpty().withMessage('Nama lengkap wajib diisi').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const formatted = errors.array().reduce((acc, e) => ({ ...acc, [e.path]: e.msg }), {});
            return res.status(400).json({ errors: formatted });
        }

        try {
            const { id } = req.params;
            const { username, complete_name, password } = req.body;

            const existingUser = await User.findById(id);
            if (!existingUser) return res.status(500).json({ errors: { username: 'User tidak ditemukan' } });

            const hashedPassword = await bcrypt.hash(password, 10);
            const dataUser = {
                username,
                complete_name,
            };
            if (password) {
                await User.update(id, {
                    ...dataUser,
                    password: hashedPassword,
                });
            } else {
                await User.update(id, dataUser);
            }

            res.status(200).json({ message: 'Pengguna berhasil diubah' });
        } catch (error) {
            res.status(500).json({ error: 'An error occurred while update the user.' });
        }
    }
}
