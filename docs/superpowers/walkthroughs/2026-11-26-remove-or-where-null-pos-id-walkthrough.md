# Walkthrough: Penghapusan `orWhereNull` dan Penegakan Wajib `pos_id` pada Pinjaman

Dokumen ini merangkum perubahan kode setelah disepakatinya penegakan aturan **strictly per `pos_id`** pada seluruh logika penomoran dan validasi kode pinjaman, serta pengabaian data historis lama yang memiliki `pos_id IS NULL`.

---

## 1. Latar Belakang Perubahan

Sebelumnya, terdapat fallback `.orWhereNull("pos_id")` pada:
1. `LoanController.getCode` (penghitungan nomor romawi pinjaman ke-N).
2. `Loan.existLoan` (validasi bentrok kode pinjaman).

Hal ini awalnya dipasang untuk merangkul 17.664 data pinjaman lama yang kolom `pos_id`-nya masih `NULL`. Namun sesuai kesepakatan bisnis:
- **Penghitungan nomor romawi baru harus strictly hanya menghitung pinjaman di POS yang sama.**
- **Pinjaman lama yang `pos_id = NULL` dibiarkan apa adanya dan tidak dihitung ke riwayat POS aktif anggota saat ini.**
- **Anggota yang belum memiliki POS dilarang dibuatkan kode pinjamannya.**
- **Perbaikan kode otomatis (`resolveDuplicateKode`) tidak boleh menyentuh data legacy yang `pos_id = NULL`.**

---

## 2. Rincian Perubahan Kode

### A. Controller `LoanController.getCode`
File: [`server/controllers/LoanController.js`](file:///d:/Projek/2025-04/koperasi-desktop/server/controllers/LoanController.js#L116-L130)

**Perubahan:**
1. Validasi keberadaan POS: Jika `member.pos_id` kosong/null, kembalikan HTTP status `400` dengan pesan `"Anggota belum memiliki POS yang valid"`.
2. Query riwayat pinjaman diubah dari `.where("pos_id", member.pos_id).orWhereNull("pos_id")` menjadi strictly:
```javascript
const rows = await db("pinjaman")
    .where("anggota_id", id)
    .where("pos_id", member.pos_id)
    .whereNull("deleted_at");
```

---

### B. Model `Loan.existLoan`
File: [`server/models/Loan.js`](file:///d:/Projek/2025-04/koperasi-desktop/server/models/Loan.js#L192-L208)

**Perubahan:**
1. Mengembalikan `null` jika `member` atau `member.pos_id` tidak valid.
2. Query pencarian pinjaman eksisting diubah menjadi strictly mencocokkan `pos_id`:
```javascript
const loan = db("pinjaman")
  .where("kode", kode)
  .where("anggota_id", anggota_id)
  .where("pos_id", member.pos_id)
  .whereNull("deleted_at");
```

---

### C. Model `Loan.resolveDuplicateKode`
File: [`server/models/Loan.js`](file:///d:/Projek/2025-04/koperasi-desktop/server/models/Loan.js#L310-L348)

**Perubahan:**
1. Menambahkan `.whereNotNull("pos_id")` pada grouping deteksi duplikasi.
2. Menyederhanakan query perbaikan menjadi strictly `.where("pos_id", item.pos_id)` tanpa fallback `whereNull`.
```javascript
const loanWithDuplicates = await db("pinjaman")
  .select("kode", "anggota_id", "pos_id")
  .whereNotNull("pos_id")
  .whereNull("deleted_at")
  .groupBy("kode", "anggota_id", "pos_id")
  .havingRaw("count(*) > 1");
```

---

## 3. Hasil Verifikasi Database

Uji coba query langsung ke database MySQL:
- Anggota dengan `pos_id = 2` hanya menghitung pinjaman yang memiliki `pos_id = 2` (data `pos_id = NULL` tidak lagi terhitung).
- Query `existLoan` berhasil mencocokkan record pinjaman aktif per `pos_id`.
- Seluruh syntax Node.js valid dan siap digunakan.
