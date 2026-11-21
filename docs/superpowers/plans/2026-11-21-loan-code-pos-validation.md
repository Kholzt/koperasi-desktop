# Penyelarasan Validasi Kode Pinjaman Berbasis POS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyelaraskan seluruh fungsi terkait pembentukan, validasi, dan perbaikan kode pinjaman (`Loan.existLoan`, `Loan.resolveDuplicateKode`, dan `LoanController.getCode`) agar konsisten menggunakan aturan bisnis: romawi pinjaman dihitung per `pos_id` per anggota, dan keunikan kode pinjaman divalidasi per `(pos_id, anggota_id, kode)`.

**Architecture:** Memperbarui query validasi di `Loan.existLoan` untuk mencocokkan `kode`, `anggota_id`, dan `pos_id` (tanpa join ambigu ke area yang berpotensi false positive/negative). Memperbarui `Loan.resolveDuplicateKode` agar mengelompokkan duplikasi berdasarkan `(pos_id, anggota_id, kode)` dan menyusun ulang nomor romawi per POS. Memverifikasi `LoanController.getCode` agar fallback `pos_id` aman jika pinjaman lama memiliki `pos_id` NULL.

**Tech Stack:** Node.js, Express, Knex.js, MySQL

**Spec:** Pembahasan `/grill-me` sesi 2026-11-21:
1. Angka Romawi (ke-N) direset per POS ketika anggota pindah POS baru (riwayat pinjaman di POS lama tetap).
2. Batasan keunikan kode pinjaman berlaku per `(pos_id, anggota_id, kode)` sehingga 1 anggota tidak memiliki 2 pinjaman dengan kode yang sama di POS yang sama.
3. Fungsi perbaikan `resolveDuplicateKode` disinkronkan dengan skema `pos_id` tersebut.

## Global Constraints
- Database client: `mysql2` via query builder `knex`.
- Jangan mengubah format umum kode: `<Romawi>/<sequence_number>`.
- Wajib memperhitungkan `deleted_at IS NULL` (soft delete) pada semua query pinjaman.
- Jangan memecah kompatibilitas data lama di mana `pos_id` pada baris pinjaman historis mungkin bernilai `NULL`.

---

### Task 1: Refactor `Loan.existLoan`

**Files:**
- Modify: `server/models/Loan.js:193-203`

**Interfaces:**
- Consumes: `anggota_id` (Number), `kode` (String), `excludeId` (Number | null, optional)
- Produces: `Loan.existLoan(anggota_id, kode, excludeId)` returning `Promise<Object|undefined>`

- [ ] **Step 1: Analisis kode lama dan tentukan implementasi baru**

Di `server/models/Loan.js`:
```javascript
// Kode lama:
static async existLoan(anggota_id, kode, excludeId) {
  const member = await db("members").where("id", anggota_id).first();
  const loan = db("pinjaman")
    .where("kode", kode)
    .join("members", "pinjaman.anggota_id", "members.id")
    .where("members.area_id", member.area_id)
    .where("pinjaman.pos_id", member.pos_id)
    .whereNull("pinjaman.deleted_at");
  if (excludeId) loan.andWhereNot("pinjaman.id", excludeId);
  return await loan.first();
}
```
Masalah pada kode lama:
1. Melakukan join ke tabel `members` yang tidak perlu karena `anggota_id` sudah ada langsung di tabel `pinjaman`.
2. Jika ada anggota lain yang kebetulan memiliki `sequence_number` sama di `area_id` yang sama, query lama akan menganggapnya bentrok padahal anggota berbeda.
3. Batasan bisnis yang disepakati: 1 anggota tidak boleh memiliki kode yang sama di POS yang sama.

Implementasi baru:
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

- [ ] **Step 2: Update file `server/models/Loan.js`**
Terapkan perubahan pada baris 193-203 di `server/models/Loan.js`.

- [ ] **Step 3: Verifikasi syntax dengan Node.js CLI**
Jalankan node check syntax untuk memastikan tidak ada kesalahan parsing pada `Loan.js`.

---

### Task 2: Selaraskan `Loan.resolveDuplicateKode` Berbasis POS

**Files:**
- Modify: `server/models/Loan.js:306-364`

**Interfaces:**
- Consumes: tidak ada parameter
- Produces: `Loan.resolveDuplicateKode()` returning `Promise<void>`

- [ ] **Step 1: Analisis logika `resolveDuplicateKode`**

Saat ini:
```javascript
const loanWithDuplicates = await db("pinjaman")
  .select("kode", "anggota_id")
  .whereNull("deleted_at")
  .groupBy("kode", "anggota_id")
  .havingRaw("count(*) > 1");
```
Jika anggota memiliki 2 pinjaman dengan kode kembar, query perbaikannya harus mengelompokkan per `pos_id` dan `anggota_id`.

Implementasi baru:
```javascript
static async resolveDuplicateKode() {
  const loanWithDuplicates = await db("pinjaman")
    .select("kode", "anggota_id", "pos_id")
    .whereNull("deleted_at")
    .groupBy("kode", "anggota_id", "pos_id")
    .havingRaw("count(*) > 1");

  if (loanWithDuplicates.length === 0) return;

  const roman = [
    ["M", 1000],
    ["CM", 900],
    ["D", 500],
    ["CD", 400],
    ["C", 100],
    ["XC", 90],
    ["L", 50],
    ["XL", 40],
    ["X", 10],
    ["IX", 9],
    ["V", 5],
    ["IV", 4],
    ["I", 1],
  ];

  await transaction(async () => {
    for (const item of loanWithDuplicates) {
      const pinjamanQuery = db("pinjaman")
        .where("kode", item.kode)
        .where("anggota_id", item.anggota_id)
        .whereNull("deleted_at")
        .orderBy("created_at", "asc")
        .orderBy("id", "asc");

      if (item.pos_id) {
        pinjamanQuery.where("pos_id", item.pos_id);
      } else {
        pinjamanQuery.whereNull("pos_id");
      }

      const pinjamanList = await pinjamanQuery;

      for (let i = 0; i < pinjamanList.length; i++) {
        const p = pinjamanList[i];
        let num = i + 1;
        let result = "";

        for (const [letter, value] of roman) {
          while (num >= value) {
            result += letter;
            num -= value;
          }
        }

        if (p.kode && p.kode.includes("/")) {
          const parts = p.kode.split("/");
          const numberStr = parts.slice(1).join("/");
          const newKode = `${result}/${numberStr}`;
          if (p.kode !== newKode) {
            await db("pinjaman").where("id", p.id).update({ kode: newKode });
          }
        }
      }
    }
  });
}
```

- [ ] **Step 2: Update file `server/models/Loan.js`**
Terapkan perubahan pada fungsi `resolveDuplicateKode`.

- [ ] **Step 3: Verifikasi syntax dengan Node.js CLI**

---

### Task 3: Verifikasi `LoanController.getCode` & Handling POS NULL

**Files:**
- Modify: `server/controllers/LoanController.js:116-164`

**Interfaces:**
- Consumes: `req.params.id` (ID anggota)
- Produces: JSON response `{ code, rows, member, num, result }`

- [ ] **Step 1: Periksa implementasi `getCode` di `LoanController.js`**
Di baris 119-121:
```javascript
const member = await db("members").select("sequence_number", "pos_id").where("id", id).first();
const rows = await db("pinjaman")
  .where("anggota_id", id)
  .where(function() {
    if (member.pos_id) {
      this.where("pos_id", member.pos_id);
    }
  })
  .whereNull("deleted_at");
```
Pastikan jika data pinjaman historis memiliki `pos_id` bernilai `NULL`, pencarian `rows` tetap menangani kondisi tersebut secara aman:
```javascript
const rows = await db("pinjaman")
  .where("anggota_id", id)
  .where(function() {
    if (member.pos_id) {
      this.where("pos_id", member.pos_id).orWhereNull("pos_id");
    }
  })
  .whereNull("deleted_at");
```
Dengan demikian, pinjaman lama yang `pos_id`-nya NULL tetap terhitung sebagai riwayat pinjaman anggota bersangkutan di POS aktifnya saat ini.

- [ ] **Step 2: Update `server/controllers/LoanController.js`**

- [ ] **Step 3: Uji jalankan query test secara langsung via node script**

---

### Task 4: Verifikasi & Test End-to-End

- [ ] **Step 1: Jalankan node script test integrasi**
Buat test script temporer untuk menguji:
1. `Loan.existLoan(anggota_id, kode)` mengembalikan hasil yang benar sesuai POS anggota.
2. Tidak ada error SQL atau syntax error saat dipanggil.
3. `Loan.resolveDuplicateKode()` berjalan normal tanpa error.

- [ ] **Step 2: Hapus script temporer dan pastikan git diff bersih**
Pastikan hanya file `server/models/Loan.js` dan `server/controllers/LoanController.js` yang berubah sesuai plan.
