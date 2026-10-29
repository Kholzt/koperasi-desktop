# Optimasi Performa - Koperasi Desktop

## Perubahan

1. **Matikan GPU (Hardware Acceleration):**
   - File: `electron/main.ts`
   - Code: `app.disableHardwareAcceleration();`
   - Efek: Hemat VRAM dan RAM (Chromium GPU process mati). Cocok untuk aplikasi CRUD yang tidak butuh grafik berat.
2. **Throttling Background:**
   - File: `electron/main.ts`
   - Code: `backgroundThrottling: true` di `webPreferences`.
   - Efek: Saat aplikasi di-minimize atau tidak fokus, CPU usage dan RAM usage akan turun karena render dibatasi.

## Hasil

- **RAM Turun:** Chromium tidak akan me-load proses GPU secara penuh.
- **CPU Idle Rendah:** Background throttling memastikan proses tidak boros CPU.

## Saran Lanjutan (Caveman)
- Jika data jutaan, paginate dari backend ke frontend.
- Pisahkan cron job dari main process jika ada.
