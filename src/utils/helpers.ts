export function formatCurrency(value: number,withCurr:boolean = true): string {
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

  export function formatDate(date: string | Date): string {
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
