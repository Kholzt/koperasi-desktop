import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

dotenv.config();

const JWT_SECRET = process.env.VITE_APP_JWT_SECRET || process.env.JWT_SECRET || 'changeme';

export default async function authenticate(req, res, next) {
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    // console.log(auth);
    if (!auth) return res.status(401).json({ message: 'Token required' });

    const parts = auth.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return res.status(401).json({ message: 'Invalid authorization format' });
    }

    const token = parts[1];
    try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (!payload || !payload.id) return res.status(401).json({ message: 'Invalid token' });

        const user = await User.findById(payload.id);
        if (!user) return res.status(401).json({ message: 'User not found' });
        // console.log(user)
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token', error: err.message });
    }
}
