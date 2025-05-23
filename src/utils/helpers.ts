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

  export function formatDate(date: string | Date = null): string {
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

  export function isDatePassed(date: string | Date): boolean {
  const targetDate = new Date(date);
  const today = new Date();

  // Set jam, menit, dan detik ke 0 agar hanya membandingkan tanggalnya saja
  targetDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return targetDate < today;
}
