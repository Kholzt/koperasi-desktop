// db.js
import knex from 'knex';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config();

/**
 * @type {import('knex').Knex}
 */
let db;

if (!globalThis.__knexInstance) {
    globalThis.__knexInstance = knex({
        client: 'mysql2',
        connection: {
            host: process.env.VITE_APP_DBHOST,
            user: process.env.VITE_APP_DBUSER,
            password: process.env.VITE_APP_DBPASS,
            database: process.env.VITE_APP_DBNAME,
        },
        pool: { min: 2, max: 10 },
    });
}

export function listBackup() {
    const backupDir = path.join(process.cwd(), 'backups');

    // Pastikan folder backup ada
    if (!fs.existsSync(backupDir)) {
        return [];  // Jika folder tidak ada, kembalikan array kosong
    }

    const files = fs.readdirSync(backupDir);

    // Filter hanya file .sql (opsional)
    const backups = files
        .filter(file => file.endsWith('.sql'))
        .sort((a, b) => b.localeCompare(a))
        .map(file => ({
            name: file,
            path: path.join(backupDir, file)
        }));

    return backups;
}

export function exportDB() {
    const backupDir = path.join(process.cwd(), 'backups');

    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }

    // Cari semua file backup
    const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.sql'));

    // Ambil tanggal 7 minggu lalu
    const now = new Date();
    const sevenWeeksAgo = new Date(now);
    sevenWeeksAgo.setDate(now.getDate() - (7 * 7)); // 7 minggu = 49 hari

    // Cek apakah ada file backup dalam 7 minggu terakhir
    const recentBackupExists = files.some(file => {
        const match = file.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [_, year, month, day] = match;
            const fileDate = new Date(`${year}-${month}-${day}`);
            return fileDate >= sevenWeeksAgo;
        }
        return false;
    });

    if (recentBackupExists) {
        console.log('Backup sudah ada dalam 7 minggu terakhir. Tidak perlu backup.');
        return;
    }

    // Kalau belum ada backup -> lanjut backup
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const timestamp = `${year}-${month}-${day}`;

    const backupFile = path.join(backupDir, `${process.env.VITE_APP_DBNAME}-backup-${timestamp}.sql`);

    const command = `mysqldump -h ${process.env.VITE_APP_DBHOST} -u ${process.env.VITE_APP_DBUSER} -p${process.env.VITE_APP_DBPASS} ${process.env.VITE_APP_DBNAME} > "${backupFile}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during backup: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`mysqldump stderr: ${backupFile}`);
            return;
        }
        console.log(`Database backup created successfully: ${backupFile}`);
    });
}


db = globalThis.__knexInstance;

export default db;
