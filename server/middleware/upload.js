// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';
// import { fileURLToPath } from 'url';

// // fix __dirname untuk ES Module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // lokasi upload
// const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');

// // pastikan folder ada
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // konfigurasi storage
// const storage = multer.diskStorage({
//     destination(req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename(req, file, cb) {
//         const ext = path.extname(file.originalname);
//         cb(null, `${Date.now()}${ext}`);
//     },
// });

// // middleware upload
// const uploadProfile = multer({
//     storage,
//     limits: {
//         fileSize: 2 * 1024 * 1024, // 2MB
//     },
//     fileFilter(req, file, cb) {
//         if (!file.mimetype.startsWith('image/')) {
//             return cb(new Error('Only image files are allowed'));
//         }
//         cb(null, true);
//     },
// });

// export default uploadProfile;


import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { app } from 'electron'; // Pastikan bisa di-import, atau gunakan process.env

const getUploadDir = () => {
    // 1. Tentukan Root Path (AppData)
    const userDataPath = app ? app.getPath('userData') : path.join(process.env.APPDATA, 'koperasi-seferine');

    // 2. Tentukan Folder Tujuan
    const dir = path.join(userDataPath, 'uploads', 'profiles');

    // 3. Buat Folder jika belum ada (Seperti di fungsi getBackupDir)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, getUploadDir()); // Memanggil fungsi yang aman
    },
    filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    },
});

const uploadProfile = multer({ storage });
export default uploadProfile;
