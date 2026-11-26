# Fungsi Realign Sequence Code Pinjaman Berbasis POS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat fungsi reusable `Loan.realignSequenceKode()` untuk merapikan urutan angka Romawi kode pinjaman per `(anggota_id, pos_id)` berdasarkan `created_at ASC, id ASC`, menjalankannya **sekali per sesi aplikasi** di dalam `Loan.resolveDuplicateKode()` (pakai flag in-memory), dan menjalankannya khusus 1 anggota & 1 POS saat `LoanController.delete`.

**Architecture:**
1. Tambah helper konversi Romawi dan static flag `_sequenceRealigned = false` di `Loan` (`server/models/Loan.js`).
2. Tambah static method `Loan.realignSequenceKode(targetPosId = null, targetAnggotaId = null)` yang memproses pinjaman aktif (`whereNotNull("pos_id").whereNull("deleted_at")`) per `(anggota_id, pos_id)` dengan urutan `created_at ASC, id ASC` di dalam `transaction()`.
3. Di `Loan.resolveDuplicateKode()`: jika `!Loan._sequenceRealigned`, jalankan `await Loan.realignSequenceKode()` sekali lalu set `Loan._sequenceRealigned = true`. Request `GET /api/loans` berikutnya tidak melakukan scan ulang penuh dan tetap menjalankan cek duplikat ringan (`HAVING count(*) > 1`).
4. Di `LoanController.delete` (`server/controllers/LoanController.js`): setelah `Loan.softDelete(id)` di dalam transaksi, jika `pinjaman.pos_id` ada, panggil `await Loan.realignSequenceKode(pinjaman.pos_id, pinjaman.anggota_id)` agar urutan Romawi anggota tersebut langsung rapi.

**Tech Stack:** Node.js, Express, Knex.js, MySQL

**Spec:** Hasil `/grill-me` 2026-11-26:
- Mekanisme sekali per sesi aplikasi: flag in-memory `Loan._sequenceRealigned` di `resolveDuplicateKode()`.
- Realign otomatis 1 anggota & 1 POS saat pinjaman dihapus (`LoanController.delete`).
- Urutan pengurutan: `created_at ASC, id ASC`.
- Abaikan record legacy dengan `pos_id IS NULL`.

## Global Constraints
- Database client: `mysql2` via `knex` dan helper `transaction()`.
- Wajib mempertahankan `whereNull("deleted_at")` dan `whereNotNull("pos_id")`.
- Sisi kanan kode (`/<seq>`) dipertahankan dari `kode.split("/").slice(1).join("/")`.

---

### Task 1: Tambah `Loan.realignSequenceKode` & Integrasi Flag di `Loan.resolveDuplicateKode`

**Files:**
- Modify: `server/models/Loan.js:311-373`

**Interfaces:**
- Produces: `Loan.realignSequenceKode(targetPosId = null, targetAnggotaId = null)` returning `Promise<{ updatedCount: number, affectedMembers: number }>`
- Uses: `Loan._sequenceRealigned` (boolean static flag)

- [ ] **Step 1: Implementasikan `toRoman`, `_sequenceRealigned`, dan `realignSequenceKode` di `server/models/Loan.js`**

Tambahkan di `Loan`:
```javascript
  static _sequenceRealigned = false;

  static _toRoman(num) {
    const roman = [
      ["M", 1000], ["CM", 900], ["D", 500], ["CD", 400],
      ["C", 100], ["XC", 90], ["L", 50], ["XL", 40],
      ["X", 10], ["IX", 9], ["V", 5], ["IV", 4], ["I", 1],
    ];
    let res = "";
    for (const [letter, val] of roman) {
      while (num >= val) {
        res += letter;
        num -= val;
      }
    }
    return res;
  }

  static async realignSequenceKode(targetPosId = null, targetAnggotaId = null) {
    const pairsQuery = db("pinjaman")
      .select("anggota_id", "pos_id")
      .whereNotNull("pos_id")
      .whereNull("deleted_at");

    if (targetPosId) pairsQuery.where("pos_id", targetPosId);
    if (targetAnggotaId) pairsQuery.where("anggota_id", targetAnggotaId);

    const pairs = await pairsQuery.groupBy("anggota_id", "pos_id");
    if (pairs.length === 0) return { updatedCount: 0, affectedMembers: 0 };

    let updatedCount = 0;
    let affectedMembers = 0;

    await transaction(async () => {
      for (const pair of pairs) {
        const loans = await db("pinjaman")
          .where("anggota_id", pair.anggota_id)
          .where("pos_id", pair.pos_id)
          .whereNull("deleted_at")
          .orderBy("created_at", "asc")
          .orderBy("id", "asc")
          .select("id", "kode");

        let memberHasChange = false;

        for (let i = 0; i < loans.length; i++) {
          const item = loans[i];
          const correctRoman = Loan._toRoman(i + 1);
          const parts = (item.kode || "").split("/");
          const currentRoman = parts[0];
          const seq = parts.slice(1).join("/");

          if (currentRoman !== correctRoman && seq) {
            await db("pinjaman")
              .where("id", item.id)
              .update({ kode: `${correctRoman}/${seq}` });
            updatedCount++;
            memberHasChange = true;
          }
        }

        if (memberHasChange) affectedMembers++;
      }
    });

    return { updatedCount, affectedMembers };
  }
```

- [ ] **Step 2: Panggil `realignSequenceKode` sekali per sesi di awal `Loan.resolveDuplicateKode()`**

Di awal `Loan.resolveDuplicateKode()`:
```javascript
  static async resolveDuplicateKode() {
    if (!Loan._sequenceRealigned) {
      await Loan.realignSequenceKode();
      Loan._sequenceRealigned = true;
    }

    const loanWithDuplicates = await db("pinjaman")
      .select("kode", "anggota_id", "pos_id")
      ...
```
Dan gunakan `Loan._toRoman(i + 1)` di loop `resolveDuplicateKode` agar tidak duplikat tabel Romawi.

---

### Task 2: Realign Anggota Terkait Saat Hapus Pinjaman (`LoanController.delete`)

**Files:**
- Modify: `server/controllers/LoanController.js:466-470`

**Interfaces:**
- Consumes: `Loan.realignSequenceKode(pinjaman.pos_id, pinjaman.anggota_id)`

- [ ] **Step 1: Tambahkan pemanggilan `Loan.realignSequenceKode` setelah `Loan.softDelete(id)`**

Di dalam transaksi `LoanController.delete`:
```javascript
                await Loan.softDelete(id);
                if (pinjaman.pos_id) {
                    await Loan.realignSequenceKode(pinjaman.pos_id, pinjaman.anggota_id);
                }
```

---

### Task 3: Verifikasi Syntax & Uji Fungsi

- [ ] **Step 1: Verifikasi syntax & eksekusi dry-check via Node.js**
Pastikan tidak ada error syntax pada `server/models/Loan.js` dan `server/controllers/LoanController.js`, serta `Loan.realignSequenceKode(2, 6963)` mengembalikan `{ updatedCount: 0, affectedMembers: 0 }` (idempoten).

- [ ] **Step 2: Cek `git diff`**
Pastikan hanya file yang ditargetkan berubah dan rapi.
