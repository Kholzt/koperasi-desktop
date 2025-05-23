// db.js
import knex from 'knex';
import dotenv from 'dotenv';

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

db = globalThis.__knexInstance;

export default db;
