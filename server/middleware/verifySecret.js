import dotenv from 'dotenv';

dotenv.config();

export default function verifySecret(req, res, next) {
    const secret = req.headers['x-app-secret'];
    if ((import.meta.env.VITE_APP_SECRET || secret) == "123412321123") {
        return next();
    }
    return res.status(403).send("Forbidden");
}
