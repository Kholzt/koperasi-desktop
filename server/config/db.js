import knex from 'knex';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { AsyncLocalStorage } from "node:async_hooks";
import { app } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


dotenv.config();

/**
 * @type {import('knex').Knex}
 */
let db;
// --- FUNGSI UTILS UNTUK PATH ---
// Kita buat fungsi agar path diambil SAAT DIBUTUHKAN, bukan saat file di-load
const getAppDataPath = () => app.getPath('userData');
const getEnvPath = () => path.join(getAppDataPath(), '.env');
const getBackupDir = () => {
    const dir = path.join(getAppDataPath(), 'backups');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
};

// --- 1. LOAD ENVIRONMENT CONFIG ---
const loadEnvConfig = () => {
    const appDataEnvPath = getEnvPath();
    const devEnvPath = path.join(process.cwd(), '.env');

    if (fs.existsSync(appDataEnvPath)) {
        dotenv.config({ path: appDataEnvPath });
        console.log('✅ Config loaded from AppData');
    } else if (fs.existsSync(devEnvPath)) {
        dotenv.config({ path: devEnvPath });
        console.log('⚠️ Config loaded from Process (Dev Mode)');
    }
};

loadEnvConfig();

// --- 2. INISIALISASI DATABASE ---
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
    globalThis.__knexInstance.on('query', (queryData) => {
        // cek apakah query mengandung nama tabel "transactions"
        if (queryData.sql.toLowerCase().includes('angsuran')) {
            console.log('--- Transactions Query ---');
            console.log('SQL:', queryData.sql);
            console.log('Bindings:', queryData.bindings);
            console.log('--------------------------');
        }
    });


    // globalThis.__knexInstance.on('query', (queryData) => {
    //     if (queryData.sql.includes("posisi_usaha")) {
    //         console.log('SQL:', queryData.sql);
    //         console.log('Bindings:', queryData.bindings);
    //     }
    // });
}
const als = new AsyncLocalStorage();

const knexInstance = globalThis.__knexInstance;

db = new Proxy(knexInstance, {
    get(target, prop) {
        const trx = als.getStore();
        const actual = trx ?? target;
        const value = actual[prop];
        // console.log('USE TRX?', !!trx);

        // bind function ke instance yang benar
        if (typeof value === "function") {
            return value.bind(actual);
        }
        return value;
    },
});

export async function transaction(callback) {
    return knexInstance.transaction(async (trx) => {

        return als.run(trx, async () => {
            return callback(db);

        });
    });
}


// --- 3. BACKUP FUNCTIONS ---

export function listBackup() {
    const dir = getBackupDir(); // Pastikan ambil dari fungsi
    const files = fs.readdirSync(dir);

    return files
        .filter(file => file.endsWith('.sql'))
        .sort((a, b) => b.localeCompare(a))
        .map(file => ({
            name: file,
            path: path.join(dir, file)
        }));
}

export function exportDB() {
    const dir = getBackupDir(); // Pastikan ambil dari fungsi
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.sql'));

    const now = new Date();
    const fortyNineDaysAgo = new Date(now);
    fortyNineDaysAgo.setDate(now.getDate() - 49);

    const isRecentExists = files.some(file => {
        const match = file.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const [_, year, month, day] = match;
            const fileDate = new Date(`${year}-${month}-${day}`);
            return fileDate >= fortyNineDaysAgo;
        }
        return false;
    });

    if (isRecentExists) {
        console.log('⏭️ Backup sudah ada dalam 7 minggu terakhir.');
        return;
    }

    const timestamp = now.toISOString().split('T')[0];
    const dbName = process.env.VITE_APP_DBNAME;
    const backupFile = path.join(dir, `${dbName}-backup-${timestamp}.sql`);

    const command = `mysqldump -h ${process.env.VITE_APP_DBHOST} -u ${process.env.VITE_APP_DBUSER} -p${process.env.VITE_APP_DBPASS} ${dbName} > "${backupFile}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ Backup Error: ${error.message}`);
            return;
        }
        console.log(`🚀 Database backup success in AppData: ${backupFile}`);
    });
}


// db = globalThis.__knexInstance;
export default db;
