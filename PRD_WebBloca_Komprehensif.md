# Product Requirement Document (PRD): Bloca E-commerce Website

**Status:** Final | **Version:** 2.0 | **Role:** Product Manager

---

## 1. Executive Summary
Bloca adalah brand UMKM aksesoris fashion (*bracelets, phone straps, bag charms, keychains*). Website ini dirancang untuk memberikan pengalaman belanja yang mewah, minimalis, dan eksklusif, serta mengintegrasikan sistem loyalitas otomatis untuk meningkatkan retensi pelanggan.

## 2. Goals & Objectives
*   **Brand Identity:** Menampilkan estetika produk yang premium dan modern.
*   **Customer Experience:** Memudahkan pelanggan dari tahap eksplorasi hingga pembayaran.
*   **Retention:** Memberikan apresiasi otomatis melalui Tier Membership (Silver/Gold).
*   **Efficiency:** Dashboard Admin yang powerful untuk mengelola katalog dan data pelanggan.

---

## 3. Core Features & Functional Requirements

### 3.1. Customer Frontend (Shopping Experience)
*   **Landing Page:** Hero section yang visual, Product Carousel untuk item "Trending", dan Brand Story.
*   **Shop Page:** 
    *   Sistem dua brand: **BLOCA** dan **BLOCA HOMME**.
    *   Filtrasi kategori dan sub-kategori (misal: Bracelet -> Bon Claire).
    *   Banner pengumuman (*Marquee*) untuk promo sale.
*   **Product Detail:** Galeri gambar, pemilihan ukuran (S, M, L), deskripsi material, dan fitur "Frequently Bought Together".
*   **Cart & Checkout:** 
    *   *Cart Drawer* untuk akses cepat ke belanjaan.
    *   Alur Checkout 3-langkah: Informasi Alamat -> Opsi Pengiriman -> Review Pesanan.

### 3.2. Membership & Loyalty System (Tiering)
*   **Point Accumulation:** Setiap belanja Rp 10.000 = 1 Poin (Poin bertambah otomatis setelah pembayaran lunas).
*   **Membership Tiers:**
    *   **Silver:** Akumulasi 1.000 Poin (Total belanja Rp 10jt).
    *   **Gold:** Akumulasi 3.000 Poin (Total belanja Rp 30jt).
*   **Automatic Benefits:**
    *   **Silver:** Diskon otomatis **10%** (Minimal belanja Rp 1.000.000).
    *   **Gold:** Diskon otomatis **13%** (Minimal belanja Rp 1.000.000).
*   **Account Page:** Member dapat memantau jumlah poin, tier saat ini, dan riwayat pesanan mereka.

### 3.3. Admin Dashboard (Management)
*   **Product Control:** CRUD produk (tambah/edit/hapus), manajemen stok, harga coret (Sale), dan upload foto.
*   **User & Membership:** Melihat data pelanggan, riwayat transaksi, dan kemampuan manual override untuk mengubah Tier atau Poin pelanggan.
*   **Order Management:** Memantau status pembayaran (via Xendit) dan input nomor resi pengiriman.

---

## 4. User Flow

### 4.1. Belanja & Membership
Pelanggan Masuk -> Eksplorasi Produk -> Tambah ke Keranjang -> Login/Register -> Checkout -> **Sistem Otomatis Cek Tier & Potong Diskon** -> Bayar via Xendit -> Poin Bertambah -> Tier Update.

### 4.2. Pengelolaan Admin
Admin Login -> Akses Dashboard -> Update Stok/Produk Baru -> Perubahan Terlihat Real-time di Web.

---

## 5. Technical Stack
*   **Frontend:** Next.js (App Router), Tailwind CSS, Shadcn UI.
*   **Backend:** Prisma ORM, Supabase (PostgreSQL).
*   **Payments:** Xendit Invoice API.
*   **Auth:** Supabase Auth.

---
**Prepared by Gemini CLI (Product Manager Bloca)**
