# OPERATIONS

Panduan operasional harian dan khususnya **hari restock**. Konteks teknis ada di [INFRASTRUCTURE.md](INFRASTRUCTURE.md) dan [BACKEND.md](BACKEND.md).

## 1. Load test (wajib sebelum restock pertama)

Tujuan: mengetahui batas sebenarnya, bukan menebak. Gunakan **k6** (atau Locust) terhadap lingkungan staging yang spesifikasinya mirip produksi, dengan **payment Xendit mode test**.

Skenario minimal:
1. **Lonjakan checkout:** N ribu virtual user menekan `POST /api/orders` untuk produk dengan stok kecil (mis. 100) secara bersamaan.
2. **Browse + checkout campuran:** 90% membaca katalog, 10% checkout.
3. **Webhook banjir:** simulasi ratusan webhook PAID bersamaan, termasuk duplikat dan tidak berurutan.
4. **Kegagalan:** matikan satu app, restart PgBouncer, matikan Redis di tengah tes, pastikan sistem tetap benar.

Kriteria lulus:
- **Stok tidak pernah negatif** dan `jumlah order sukses × qty == stok awal - stok akhir` (invarian utama).
- Tidak ada order ganda dari retry dengan Idempotency-Key yang sama.
- p95 latency jalur checkout di bawah target (mis. < 1 detik) pada beban target; error di bawah ambang.
- Setelah tes, job expire mengembalikan semua stok yang ditahan dan angka kembali konsisten.
- Rekonsiliasi memperbaiki webhook yang sengaja dihilangkan.

Ulangi load test setiap perubahan besar pada jalur checkout/pembayaran.

## 2. Checklist hari restock

**H-7 sampai H-1**
- [ ] Load test lulus pada beban 2-3× perkiraan terburuk
- [ ] Deploy freeze dimulai (tidak ada rilis sampai restock selesai)
- [ ] Backup penuh terbaru ada **dan restore sudah diuji**
- [ ] Umumkan jam restock; siapkan halaman pengumuman/hitung mundur statis (di CDN, tanpa beban DB)
- [ ] Verifikasi batas per akun, rate limit, Turnstile aktif
- [ ] Verifikasi kredensial Xendit produksi, callback URL, dan token verifikasi
- [ ] Pastikan kapasitas Xendit/akun tidak terkena limit transaksi

**H-1 jam**
- [ ] Scale out app ke jumlah restock (mis. 2 → 6)
- [ ] Naikkan worker bila perlu; cek antrean job kosong
- [ ] Muat stok ke Redis (gate stok), bandingkan dengan Postgres
- [ ] Warm-up cache katalog dan halaman produk
- [ ] Cek dashboard Grafana, alert aktif, orang jaga (on-call) siap, kanal komunikasi terbuka
- [ ] Cek disk, koneksi DB, replica lag

**Saat restock**
- [ ] Pantau: RPS, p95/p99, error rate, koneksi DB (PgBouncer pool terpakai), lock wait, antrean job, rate Redis
- [ ] Pantau invarian: stok tidak negatif; jumlah `PENDING_PAYMENT` wajar
- [ ] Siap menaikkan rate limit/mengaktifkan waiting room bila DB mulai jenuh
- [ ] Jangan melakukan perubahan produksi kecuali mitigasi insiden

**Setelah restock**
- [ ] Biarkan job expire dan rekonsiliasi berjalan; cek tidak ada pembayaran `PENDING` yang menggantung
- [ ] Bandingkan total PAID di DB dengan laporan Xendit (selisih harus nol atau dijelaskan)
- [ ] Scale in app, kembalikan konfigurasi normal
- [ ] Tulis catatan singkat: apa yang berjalan baik, apa yang lambat, tindakan perbaikan

## 3. Monitoring dan alert minimum

| Metrik | Alert bila |
|---|---|
| Error rate 5xx | > 2% selama 2 menit |
| p95 latency `/api/orders` | di atas target selama 5 menit |
| Koneksi PgBouncer terpakai | > 80% pool |
| Lock wait / transaksi menggantung | ada transaksi > 10 detik |
| Replication lag | > 5 detik |
| Antrean job (BullMQ) | menumpuk > ambang atau job gagal berulang |
| Pembayaran `PENDING` > 15 menit | ada, dan tidak turun |
| Selisih rekonsiliasi Xendit vs DB | tidak nol |
| Refund `PENDING` > 24 jam | ada |
| Disk Postgres / Redis memori | > 80% |
| Sertifikat TLS | < 14 hari |
| Backup terakhir | gagal atau lebih tua dari 26 jam |

## 4. Backup dan pemulihan
- Postgres: base backup harian + WAL kontinu (pgBackRest/WAL-G) → PITR. Retensi minimal 14-30 hari.
- Redis: AOF aktif; ingat Redis bukan sumber kebenaran, jadi hilangnya Redis tidak boleh menghilangkan data bisnis.
- Object storage gambar: versioning atau replikasi ke bucket lain.
- Simpan backup di penyedia/region berbeda dari server utama.
- **Latihan restore tiap kuartal** ke lingkungan terpisah dan catat waktunya (RTO) serta data yang hilang (RPO).
- Target awal: RPO ≤ 5 menit (berkat WAL), RTO ≤ 1 jam.

## 5. Runbook insiden

**Database jenuh (koneksi habis / lock menumpuk)**
1. Cek `pg_stat_activity` untuk transaksi lama/idle in transaction; hentikan yang menggantung.
2. Aktifkan waiting room / turunkan batas rate di Cloudflare.
3. Bila perlu, kurangi jumlah app sementara (mengurangi tekanan koneksi) sambil menjaga antrean.
4. Jangan restart Postgres kecuali terpaksa; periksa dulu query penyebab di `pg_stat_statements`.

**Webhook Xendit gagal diproses / menumpuk**
1. Pastikan endpoint hidup dan token benar.
2. Periksa tabel `webhook_events` yang belum `processedAt`; jalankan ulang worker.
3. Jalankan rekonsiliasi manual untuk semua `payments` `PENDING`.
4. Bandingkan dengan dashboard Xendit; pembayaran yang sukses di Xendit tetapi tidak tercatat harus ditemukan oleh rekonsiliasi, bukan ditangani manual satu per satu.

**Pembeli lapor "sudah bayar tapi order belum berubah"**
1. Cari `payments` berdasarkan order; lihat status dan `webhook_events`.
2. Cek invoice di dashboard Xendit. Bila PAID di Xendit, jalankan `applyPaymentResult` (rekonsiliasi) untuk order tersebut.
3. Bila order sudah `EXPIRED` dan stok habis, proses **refund** dan beri tahu pembeli.
4. Jangan mengubah status order manual lewat SQL tanpa mencatat di audit.

**Redis mati**
1. Gate stok dan rate limit berhenti; sistem harus tetap benar (Postgres menjaga stok). Perkirakan beban DB naik.
2. Aktifkan rate limit di Cloudflare sebagai cadangan; pulihkan Redis; isi ulang counter stok dari Postgres.

**Satu app server mati**
LB mengeluarkannya otomatis lewat health check. Tambah instance pengganti; selidiki penyebab setelah stabil.

## 6. Rutinitas berkala
- Harian: cek alert, status backup, antrean job, selisih rekonsiliasi.
- Mingguan: tinjau query lambat, ukuran tabel, `VACUUM`/bloat, kapasitas disk.
- Bulanan: update OS dan image, `npm audit`, rotasi kunci yang perlu, tinjau biaya.
- Kuartalan: latihan restore, load test ulang, tinjau akses dan firewall.
