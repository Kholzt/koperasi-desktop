import Holidays from "date-holidays";
let hd = new Holidays("ID");




export function isHoliday(date) {
    const d = new Date(date);
    const isLibur = hd.isHoliday(d);
    const isSunday = d.getDay() === 0; // 0 = Sunday
    return isLibur || isSunday;
}

export function getAllHoliday(year) {
    return hd.getHolidays(year)
}
