# `design.md` - BLOCA E-Commerce UX/UI Design System & Documentation

Dokumen ini berisi panduan desain, filosofi UX, arsitektur informasi, dan arah visual untuk pembuatan website e-commerce **BLOCA** (Aksesori UMKM).

---

## 1. Filosofi & Strategi Produk

### Visi Produk
Menjadi platform e-commerce aksesori yang tidak hanya berfungsi sebagai toko online, tetapi juga sebagai ruang pameran digital (*digital exhibition*). Website harus terasa intim, personal, namun sangat responsif dan mudah digunakan.

### Pilar Utama UX
* **Frictionless Shopping:** Memangkas setiap langkah yang tidak perlu mulai dari pencarian produk hingga *checkout*.
* **Visual-Heavy, Text-Light:** Aksesori adalah produk visual. Biarkan foto produk berkualitas tinggi yang berbicara; kurangi tumpukan teks yang mengalihkan perhatian.
* **Mobile-First Empathy:** Mayoritas target pasar aksesori berbelanja melalui *smartphone*. Desain harus dioptimalkan untuk navigasi satu tangan (*thumb-zone friendly*).

---

## 2. Arah Visual & UI (Look & Feel)

Untuk memanjakan mata tanpa merusak konsep minimalis, kita menggunakan teknik *soft contrast*, tipografi yang elegan, dan pemanfaatan *white space* (ruang kosong) yang masif untuk memberikan kesan premium.

### Palette Warna (Color Palette)
Menggunakan warna-warna bumi yang tenang (*calming earth tones*) agar warna-warni aksesori BLOCA tetap menjadi pusat perhatian utama.

| Fungsi | Warna | Hex Code | Kesan Visual |
| :--- | :--- | :--- | :--- |
| **Primary/Background** | Pure White / Light Ivory | `#FFFFFF` / `#F9F8F6` | Bersih, luas, dan memberikan ruang bernapas bagi produk. |
| **Secondary/Text** | Charcoal Black | `#1A1A1A` | Kontras tinggi untuk keterbacaan yang tajam, menggantikan hitam pekat agar lebih lembut di mata. |
| **Accent/Action** | Muted Sage Green / Clay | `#7A8B7B` / `#C29482` | Digunakan secara hemat hanya untuk tombol CTA (*Call to Action*) seperti "Beli Sekarang". |
| **Surface/Card** | Soft Off-White | `#F3F3F3` | Untuk memisahkan section atau latar belakang kartu produk. |

### Tipografi
* **Headings (Judul):** `Playfair Display` atau `Cormorant Garamond` (Serif). Memberikan kesan *craftsmanship*, elegan, dan estetik ala brand lokal premium.
* **Body & UI Text (Navigasi, Tombol, Deskripsi):** `Inter` atau `Plus Jakarta Sans` (Sans-serif). Sangat bersih, modern, dan memiliki keterbacaan yang luar biasa di layar kecil.

---

## 3. Arsitektur Informasi & User Flow

### Peta Situs (Sitemap) Sederhana
```
[Home]
  ├── [Koleksi / Katalog]
  │     ├── Filter & Sort (Kategori, Bahan, Harga)
  │     └── [Halaman Detail Produk (PDP)]
  ├── [Cerita BLOCA (About Us)]
  └── [Keranjang / Checkout]
```

### UX Magic Point: Filter yang Minimalis
Alih-alih menggunakan *sidebar* filter yang rumit dan memakan tempat, BLOCA akan menggunakan **Filter Drawer (Slide-out)** pada mobile dan **Horizontal Sticky Filter Bar** pada desktop yang hanya muncul saat di-scroll ke atas.

---

## 4. Cetak Biru Komponen Antarmuka (UI Components)

### A. Beranda (Homepage) — *The First Impression*
* **Hero Section:** Bukan *carousel banner* yang bergerak cepat (karena mengganggu UX). Gunakan satu *high-quality editorial photo* produk terbaik BLOCA dengan teks minimalis: *"Detail Kecil, Cerita Besar."* dan satu tombol CTA utama: `Jelajahi Koleksi`.
* **Curated Grid:** Menampilkan 4 produk terlaris menggunakan layout grid asimetris (seperti majalah fashion) untuk memberikan kesan estetik dan dinamis.
* **Micro-Animation:** Foto produk akan berubah secara halus memperlihatkan *angle* kedua (misal: saat dipakai model) ketika kursor diarahkan ke foto tersebut (*hover effect*).

### B. Halaman Produk (Product Detail Page - PDP)
Halaman ini adalah penentu konversi. Desain dibuat super bersih:
* **Sticky Galeri (Desktop):** Foto produk berada di sisi kiri dan tetap diam/scrolling secara independen, sementara detail produk di sisi kanan tetap di posisinya.
* **Sticky "Add to Cart" (Mobile):** Saat pengguna membaca deskripsi produk ke bawah, tombol `+ Keranjang` akan melayang (*sticky*) di bagian bawah layar. Pengguna tidak perlu scroll kembali ke atas untuk membeli.
* **Accordion Detail:** Informasi seperti "Bahan", "Cara Perawatan", dan "Kebijakan Pengembalian" disembunyikan di dalam sistem *accordion* (bisa di-klik untuk buka-tutup) agar halaman tidak penuh teks.

### C. Proses Checkout yang Mulus (Seamless Checkout)
* **Express Checkout:** Integrasikan opsi pembayaran cepat (seperti QRIS, GoPay/ShopeePay langsung di halaman keranjang) tanpa memaksa pengguna membuat akun (*Guest Checkout* adalah wajib).
* **One-Page Checkout:** Semua input (Alamat, Kurir, Pembayaran) berada di satu halaman yang dibagi menjadi 3 tahapan akordeon visual yang jelas.

---

## 5. Detail UX Mikro (Micro-interactions & Delight)

* **Skeleton Loading:** Saat memuat halaman atau produk baru, tampilkan efek *shimmering skeleton* berwarna abu-abu lembut, bukan *loading spinner* berputar yang membosankan. Ini membuat persepsi waktu tunggu terasa lebih cepat.
* **Toast Notification:** Ketika barang sukses masuk keranjang, muncul notifikasi kecil yang elegan di sudut kanan atas: *"Aksesori terpilih telah ditambahkan ke keranjang"* beserta tombol pintas *Checkout*.
* **Empty State yang Manis:** Jika keranjang kosong, jangan hanya tulis "Keranjang Anda Kosong". Tampilkan ilustrasi minimalis garis halus dengan teks: *"Keranjangmu masih sepi, yuk intip koleksi terbaru kami"* lalu beri tombol yang mengarah ke katalog.

---

> ### Catatan Implementasi untuk Developer:
> * Pastikan optimasi gambar (*image compression*) dilakukan dengan ketat (gunakan format `.webp` atau `.avif`) karena website ini mengandalkan banyak visual besar.
> * Gunakan transisi CSS halus (`transition: all 0.3s ease`) untuk setiap interaksi tombol dan *hover* foto agar terasa premium.