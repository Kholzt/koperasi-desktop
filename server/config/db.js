import mysql from 'mysql2/promise';

// Buat koneksi pool (lebih aman dan efisien)
const pool = mysql.createPool({
  host: import.meta.env.VITE_APP_DBHOST,
  user: import.meta.env.VITE_APP_DBUSER,
  password: import.meta.env.VITE_APP_DBPASS, // sesuaikan dengan password kamu
  database: import.meta.env.VITE_APP_DBNAME, // ganti dengan nama database kamu
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;


// import { PrismaClient } from '@prisma/client'

// const db = new PrismaClient()

// export default db;
