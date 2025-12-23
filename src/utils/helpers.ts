import axios from "./axios";

export function formatCurrency(value: number = 0,withCurr:boolean = true): string {
    return withCurr ?new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value):new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
      }).format(value)
  }

export function unformatCurrency(value: string): number {
    // Menghapus simbol mata uang dan pemisah ribuan
    const unformattedValue = value.replace(/[^\d,-]/g, '').replace(',', '.');
    // Mengembalikan nilai sebagai angka (float)
    return parseFloat(unformattedValue);
}

export function formatDate(date: string | Date | null = null): string {
    if(!date)return "";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
}

export function formatLongDate(date: string | Date): string {
    return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    });
}
export function toLocalDate (date: Date)  {
    if(!date)return "";
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export function isDatePassed(date: string | Date): boolean {
  const targetDate = new Date(date);
  const today = new Date();

  // Set jam, menit, dan detik ke 0 agar hanya membandingkan tanggalnya saja
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return targetDate < today;
}

export function calculateDuration(start:any, end:any) {
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
        months -= 1;
        const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
        days += prevMonth.getDate(); // jumlah hari di bulan sebelumnya
    }

    if (months < 0) {
        years -= 1;
        months += 12;
    }

    return { years, months, days };
}


export async function getPosisiUsaha(code:string) {
    const res = await axios(`/api/posisi-usaha?code=${code}`)
    return res.data.amount
}
