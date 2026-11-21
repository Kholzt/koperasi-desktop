# Walkthrough: Penyelarasan Validasi Kode Pinjaman Berbasis POS

Dokumen ini merangkum perubahan kode dan alur kerja setelah penyelarasan aturan bisnis: **angka romawi pinjaman ke-N dihitung per POS per anggota**, serta **batasan keunikan kode pinjaman berlaku per `(pos_id, anggota_id, kode)`**.

---

## 1. Masalah Sebelum Perubahan

1. **`Loan.existLoan` salah target:**
   - Melakukan `join("members")` dan memfilter `members.area_id`.
   - Mengakibatkan anggota berbeda di area berbeda tapi bernomor urut sama dianggap saling bentrok, atau sebaliknya jika anggota sama punya pinjaman ganda tidak terdeteksi secara tepat.
2. **`Loan.resolveDuplicateKode` belum sadar POS:**
   - Hanya mengelompokkan `groupBy("kode", "anggota_id")` tanpa membedakan `pos_id`.
   - Ketika anggota pindah POS dan memulai pinjaman dari Romawi `I`, sistem perbaikan otomatis lama bisa salah mendeteksi dan mengubah kode pinjaman yang sebenarnya sah di POS berbeda.
3. **`LoanController.getCode` berpotensi abaikan data legacy:**
   - Memfilter `pos_id = member.pos_id` secara kaku, sehingga pinjaman lama yang kolom `pos_id`-nya masih `NULL` tidak terhitung ke riwayat pinjaman ke-N anggota.

---

## 2. Rincian Perubahan Kode

### A. Model `Loan.existLoan`
File: [`server/models/Loan.js`](file:///d:/Projek/2025-04/koperasi-desktop/server/models/Loan.js#L193-L211)

```javascript
static async existLoan(anggota_id, kode, excludeId) {
  const member = await db("members").select("pos_id").where("id", anggota_id).first();
  if (!member) return null;

  const loan = db("pinjaman")
    .where("kode", kode)
    .where("anggota_id", anggota_id)
    .where(function () {
      if (member.pos_id) {
        this.where("pos_id", member.pos_id).orWhereNull("pos_id");
      }
    })
    .whereNull("deleted_at");

  if (excludeId) {
    loan.andWhereNot("id", excludeId);
  }

  return await loan.first();
}
```
*Efek:* Validasi saat input/edit pinjaman langsung mengecek ke tabel `pinjaman` milik anggota bersangkutan di POS yang relevan tanpa join tabel yang tidak diperlukan.

---

### B. Model `Loan.resolveDuplicateKode`
File: [`server/models/Loan.js`](file:///d:/Projek/2025-04/koperasi-desktop/server/models/Loan.js#L315-L381)

```javascript
static async resolveDuplicateKode() {
  const loanWithDuplicates = await db("pinjaman")
    .select("kode", "anggota_id", "pos_id")
    .whereNull("deleted_at")
    .groupBy("kode", "anggota_id", "pos_id")
    .havingRaw("count(*) > 1");

  if (loanWithDuplicates.length === 0) return;

  // ... penyusunan ulang Romawi diurutkan per item.pos_id dan item.anggota_id ...
}
```
*Efek:* Deteksi dan perbaikan nomor romawi otomatis hanya menargetkan pinjaman yang benar-benar duplikat di POS yang sama untuk anggota yang sama.

---

### C. Controller `LoanController.getCode`
File: [`server/controllers/LoanController.js`](file:///d:/Projek/2025-04/koperasi-desktop/server/controllers/LoanController.js#L116-L135)

```javascript
const member = await db("members").select("sequence_number", "pos_id").where("id", id).first();
const rows = await db("pinjaman")
  .where("anggota_id", id)
  .where(function() {
    if (member?.pos_id) {
      this.where("pos_id", member.pos_id).orWhereNull("pos_id");
    }
  })
  .whereNull("deleted_at");
let num = rows.length + 1;
```
*Efek:* Penomoran Romawi berikutnya dihitung dari total pinjaman aktif anggota di POS tersebut ditambah data legacy (pos_id NULL).

---

## 3. Alur Verifikasi (Test Verification)

Uji query Knex terhadap database MySQL aktif:
```javascript
// Memeriksa pencarian eksistensi kode pinjaman eksisting
const existing = await knex('pinjaman')
  .where('kode', sample.kode)
  .where('anggota_id', sample.anggota_id)
  .where(function() {
    if (member?.pos_id) {
      this.where('pos_id', member.pos_id).orWhereNull('pos_id');
    }
  })
  .whereNull('deleted_at')
  .first();

// Hasil: Query sukses dieksekusi tanpa error syntax dan menemukan entri yang tepat.
```

---

## 4. Status Checkbox Plan

- [x] **Task 1: Refactor `Loan.existLoan`**
- [x] **Task 2: Selaraskan `Loan.resolveDuplicateKode` Berbasis POS**
- [x] **Task 3: Verifikasi `LoanController.getCode` & Handling POS NULL**
- [x] **Task 4: Verifikasi & Test End-to-End**
