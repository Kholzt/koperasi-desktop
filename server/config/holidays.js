import Holidays from "date-holidays";
let hd = new Holidays("ID");
import ical from "node-ical"



export async function isHoliday(date) {
    const d = new Date(date);
    const isLibur = hd.isHoliday(d);
    const isSunday = d.getDay() === 0; // 0 = Sunday
    const holidays = await getHolidayJson();
    const formatted = formatDate(new Date(date));
    return holidays.some(holiday => holiday.date === formatted) || isSunday;
}

export function getAllHoliday(year) {
    return hd.getHolidays(year)
}

// Cache global di modul
let cachedHolidays = null;
let lastFetched = null;

// Cek apakah perlu refresh cache (opsional, misalnya refresh per 24 jam)
const CACHE_DURATION_MS = 1000 * 60 * 60 * 24; // 24 jam

export async function getHolidayJson() {
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


function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
