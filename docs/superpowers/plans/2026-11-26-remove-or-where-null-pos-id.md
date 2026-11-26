# Penghapusan `orWhereNull` dan Penegakan Wajib `pos_id` pada Pinjaman Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menegakkan aturan strictly per `pos_id` pada seluruh logika penomoran kode pinjaman (`getCode`), validasi keunikan (`existLoan`), dan perbaikan duplikasi (`resolveDuplicateKode`) dengan menghapus seluruh fallback `orWhereNull("pos_id")`, mewajibkan anggota memiliki `pos_id` saat `getCode`, serta mengabaikan pinjaman historis yang memiliki `pos_id = NULL`.

**Architecture:** 
1. Di `LoanController.getCode`, validasi awal: jika `member.pos_id` kosong/null, kembalikan status 400 error. Query riwayat pinjaman strictly `.where("pos_id", member.pos_id)`.
2. Di `Loan.existLoan`, filter query strictly `.where("pos_id", member.pos_id)`.
3. Di `Loan.resolveDuplicateKode`, tambahkan filter `.whereNotNull("pos_id")` pada select dan query update agar data legacy NULL tidak ikut diproses.
4. Database dibiarkan apa adanya (tanpa backfill).
5. Buat file walkthrough dokumentasi di `docs/superpowers/walkthroughs/2026-11-26-remove-or-where-null-pos-id-walkthrough.md`.

**Tech Stack:** Node.js, Express, Knex.js, MySQL

**Spec:** Pembahasan `/grill-me` sesi 2026-11-26:
- Data lama `pos_id = NULL` dibiarkan apa adanya dan tidak dihitung pada romawi baru.
- Jika anggota belum memiliki `pos_id`, `getCode` menolak dengan error.
- Hapus `.orWhereNull("pos_id")` pada `getCode` dan `existLoan`.
- `resolveDuplicateKode` hanya memperbaiki duplikasi pada data yang `pos_id`-nya ada (`whereNotNull("pos_id")`).

---

### Task 1: Update `LoanController.getCode`
**Files:**
- Modify: `server/controllers/LoanController.js:116-165`

- [ ] Validasi `member.pos_id` (return 400 jika tidak ada).
- [ ] Ubah filter `rows` menjadi `where("pos_id", member.pos_id)`.

---

### Task 2: Update `Loan.existLoan`
**Files:**
- Modify: `server/models/Loan.js:193-211`

- [ ] Ubah query `existLoan` menjadi strictly `where("pos_id", member.pos_id)`.

---

### Task 3: Update `Loan.resolveDuplicateKode`
**Files:**
- Modify: `server/models/Loan.js:315-381`

- [ ] Tambahkan `.whereNotNull("pos_id")` pada grouping dan query update.

---

### Task 4: Verifikasi & Buat Walkthrough
**Files:**
- Create: `docs/superpowers/walkthroughs/2026-11-26-remove-or-where-null-pos-id-walkthrough.md`

- [ ] Test eksekusi query lewat Node.js script.
- [ ] Simpan dokumentasi walkthrough lengkap.
