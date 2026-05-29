# Product Requirement Document (PRD): Bloca Membership & Admin Dashboard

**Status:** Final | **Version:** 1.1 | **Role:** Product Manager

---

## 1. Project Overview
Bloca adalah brand UMKM aksesoris yang ingin meningkatkan loyalitas pelanggan melalui sistem membership berbasis tier. Sistem ini memberikan apresiasi otomatis kepada pelanggan setia berdasarkan akumulasi belanja mereka, tanpa perlu melakukan penukaran poin manual.

## 2. Goals & Objectives
*   **Meningkatkan Customer Loyalty:** Memberikan insentif berupa diskon otomatis bagi member Silver dan Gold.
*   **Sistem Ranking yang Adil:** Menggunakan sistem poin sebagai tolok ukur kenaikan tier (Lifetime Value).
*   **Kemudahan Operasional:** Admin dapat mengelola produk dan data pelanggan (termasuk tier) secara mandiri melalui dashboard.

## 3. Functional Requirements

### 3.1. Membership Tier System (Ranking)
Sistem poin digunakan secara internal untuk menentukan tingkatan (Tier) pelanggan.
*   **Earning Rule:** Setiap belanja Rp 10.000 mendapatkan 1 Poin.
*   **Point Trigger:** Poin hanya bertambah setelah status pembayaran pesanan menjadi `PAID` (via Xendit).
*   **Tier Thresholds:**
    *   **Silver:** Minimal akumulasi 1.000 Poin (Setara belanja Rp 10.000.000).
    *   **Gold:** Minimal akumulasi 3.000 Poin (Setara belanja Rp 30.000.000).
    *   **Platinum:** Minimal akumulasi 10.000 Poin (Opsional/Masa Depan).

### 3.2. Automatic Tier Discounts (Benefits)
Pelanggan yang sudah mencapai tier tertentu akan mendapatkan diskon otomatis saat checkout jika memenuhi syarat minimal belanja.
*   **Syarat Minimal Belanja:** Total produk dalam satu pesanan >= Rp 1.000.000.
*   **Discount Rates:**
    *   **Silver Member:** Diskon otomatis **10%**.
    *   **Gold Member:** Diskon otomatis **13%**.
*   **Logic:** Sistem akan mendeteksi tier user secara otomatis saat proses checkout dan menerapkan potongan harga sebelum dialihkan ke halaman pembayaran Xendit.

### 3.3. Admin Dashboard Capabilities
Admin memiliki kontrol penuh untuk menjaga integritas data dan katalog.
*   **Product Management:** CRUD (Create, Read, Update, Delete) produk, manajemen stok real-time, dan pengaturan harga/kategori.
*   **Customer Management:**
    *   Melihat daftar seluruh pelanggan dan riwayat belanja mereka.
    *   Mengubah data akun pelanggan (Nama, Alamat, No. HP).
    *   Mengubah Tier atau Poin pelanggan secara manual (Admin Override).

## 4. User Experience (UX)

### 4.1. Customer Journey
1.  **Halaman Akun/Rewards:** Pelanggan dapat melihat Tier mereka saat ini, jumlah poin, dan sisa poin yang dibutuhkan untuk naik ke tier berikutnya.
2.  **Halaman Checkout:** Jika pelanggan adalah member Silver/Gold dan belanja > Rp 1jt, baris "Membership Discount" akan muncul otomatis di ringkasan pesanan.

### 4.2. Admin Experience
1.  **Dashboard Utama:** Melihat ringkasan performa penjualan dan jumlah member aktif.
2.  **Detail User:** Antarmuka yang bersih untuk melakukan audit atau perubahan manual pada profil pelanggan.

## 5. Technical Stack (Reference)
*   **Framework:** Next.js (App Router).
*   **ORM/Database:** Prisma & Supabase (PostgreSQL).
*   **Payment Gateway:** Xendit (Invoice API & Webhooks).
*   **Auth:** Supabase Auth terintegrasi dengan tabel `User`.

## 6. Success Metrics
*   **Tier Progression:** Jumlah user yang berhasil naik dari Silver ke Gold dalam periode 6 bulan.
*   **Average Order Value (AOV):** Peningkatan jumlah pesanan yang mencapai threshold Rp 1.000.000.
*   **Admin Efficiency:** Kemudahan admin dalam mengupdate stok harian tanpa bantuan teknis.

---
**Prepared by Gemini CLI (Product Manager Bloca)**
