import Holidays from "date-holidays";
import fs from 'fs/promises';
import ical from "node-ical";
import path from 'path';
let hd = new Holidays("ID");

// Cache global di modul
let cachedHolidays = null;
let lastFetched = null;

const CACHE_DURATION_MS = 1000 * 60 * 60 * 24; // 24 jam
const filePath = path.join(process.cwd(), 'extras', 'holiday.json');


export async function isHoliday(date) {
    const d = new Date(date);
    const isSunday = d.getDay() === 0; // 0 = Sunday
    const holidays = await getHolidayJson();
    const formatted = formatDate(new Date(date));
    return holidays.some(holiday => holiday.date === formatted) || isSunday;
}

export function getAllHoliday(year) {
    return hd.getHolidays(year)
}

export async function getHolidayJson() {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content); // kembalikan array of { title, date }
    } catch (err) {
        console.error('❌ Gagal membaca holiday.json:', err.message);
        return []; // fallback kosong jika file tidak ditemukan
    }
}
export async function getHolidayApi() {
    const now = Date.now();

    if (cachedHolidays && lastFetched && (now - lastFetched < CACHE_DURATION_MS)) {
        return cachedHolidays; // gunakan data dari cache
    }

    const url = 'https://calendar.google.com/calendar/ical/id.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics';

    try {
        const data = await ical.async.fromURL(url);

        cachedHolidays = Object.values(data)
            .filter(item => item.type === 'VEVENT')
            .map(event => ({
                title: event.summary,
                date: formatDate(event.start)
            }));

        lastFetched = now;
        return cachedHolidays;
    } catch (err) {
        console.error('Gagal mengambil data iCal:', err.message);
        return cachedHolidays || []; // fallback
    }
}


export async function saveHolidayJson() {
    const folderPath = path.join(process.cwd(), 'extras');
    const filePath = path.join(folderPath, 'holiday.json');
    const fileInfo = path.join(folderPath, 'update-info.txt');
    const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

    try {

        await fs.mkdir(folderPath, { recursive: true });


        try {
            const lastSavedDate = await fs.readFile(fileInfo, 'utf-8');
            if (lastSavedDate.trim() === today) {
                console.log('✅ File holiday.json sudah dibuat hari ini, tidak perlu update.');
                return;
            }
        } catch (_) {
            // File belum ada → lanjut generate
        }

        const holidays = await getHolidayApi();

        // Simpan atau timpa file holiday.json
        await fs.writeFile(filePath, JSON.stringify(holidays, null, 2), 'utf-8');
        await fs.writeFile(fileInfo, today, 'utf-8');

    } catch (err) {
        console.error('❌ Gagal menyimpan holiday.json:', err.message);
    }
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
