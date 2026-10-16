# INFRASTRUCTURE

Rancangan infrastruktur BLOCA setelah keluar dari Supabase. Pola trafiknya tidak biasa: **sepi lama, lalu meledak sesaat setelah restock** (flash-sale style). Semua keputusan di sini dioptimalkan untuk pola itu, bukan untuk trafik rata.

Dokumen terkait:
- [BACKEND.md](BACKEND.md): race condition stok, alur checkout, penanganan pembayaran gagal
- [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md): langkah keluar dari Supabase
- [OPERATIONS.md](OPERATIONS.md): checklist hari restock, monitoring, backup, insiden

> Angka kapasitas dan spesifikasi di bawah adalah **titik awal perencanaan**, bukan hasil pengukuran. Wajib divalidasi dengan load test (lihat OPERATIONS.md) sebelum restock pertama.

---

## 1. Prinsip desain

1. **Database adalah satu-satunya sumber kebenaran stok dan uang.** Redis/cache hanya pintu depan untuk menahan beban, tidak pernah menjadi penentu final.
2. **App server stateless.** Tidak ada file, sesi, atau cache lokal di container app, supaya bisa ditambah/dikurangi sebebasnya di belakang load balancer.
3. **Lindungi database, bukan hanya app.** Saat ledakan, bottleneck hampir pasti Postgres (koneksi dan row lock stok), bukan CPU Next.js.
4. **Tolak lebih awal dan murah.** Request yang pasti gagal (stok habis, bot, terlalu cepat) harus ditolak di CDN/Redis, jangan sampai menyentuh Postgres.
5. **Semua yang menyangkut uang harus idempotent dan bisa direkonsiliasi.** Detail di BACKEND.md.

## 2. Arsitektur

```
                    Pengguna
                        |
            [ Cloudflare: DNS + CDN + WAF + rate limit + bot protection ]
                        |
                 [ Load Balancer ]  (Nginx / HAProxy / Traefik, 2 node + failover IP)
                  /      |       \
          [ app-1 ]  [ app-2 ]  [ app-N ]      Next.js standalone (container, stateless)
                  \      |       /
        +----------+-----+-------+------------------+
        |                        |                  |
  [ Redis ]              [ PgBouncer ]       [ Object Storage ]
  rate limit, antrean,          |             gambar produk (S3-compatible)
  gate stok, cache,       [ PostgreSQL primary ] --streaming--> [ PostgreSQL replica ]
  queue (BullMQ)                |                                (baca katalog, dashboard admin)
        |                  [ Backup ke object storage: base backup + WAL ]
  [ Worker ]  BullMQ: expire order, rekonsiliasi pembayaran, email, retry webhook
```

Komponen eksternal: **Xendit** (pembayaran), layanan email transaksional, layanan ongkir bila dipakai.

## 3. Komponen

### 3.1 Edge: Cloudflare (disarankan)
- CDN untuk aset statis dan gambar produk, sehingga trafik gambar tidak menyentuh VPS.
- **Rate limiting** dan **bot protection** (Turnstile di halaman login/checkout). Bot pembeli otomatis adalah ancaman utama saat restock.
- Cache halaman katalog/detail produk dengan TTL pendek (5-30 detik) atau `stale-while-revalidate`. Halaman produk sebaiknya **tidak** dihitung ulang tiap request.
- Jangan cache `/api/cart`, `/api/orders`, `/api/payment/*`.
- Whitelist/validasi IP Xendit untuk endpoint webhook bila memungkinkan, di atas verifikasi callback token.

### 3.2 Load balancer
- Nginx, HAProxy, atau Traefik. Minimal **2 node LB** dengan floating IP / failover (keepalived) bila memakai VPS biasa. Atau pakai load balancer terkelola milik provider (lebih sederhana, tidak ada single point of failure yang dikelola sendiri).
- Health check ke endpoint `/api/health` (cek app hidup + bisa query DB ringan).
- Algoritma `least_conn`. **Tidak perlu sticky session** karena app stateless.
- `proxy_read_timeout` secukupnya (30s). Kembalikan `503` + `Retry-After` saat overload, bukan membiarkan request menggantung.
- Terapkan **batas koneksi/queue per upstream** supaya app tidak menerima lebih dari yang sanggup diproses.

### 3.3 Application servers
- Container Next.js `output: 'standalone'` (sudah disiapkan di Dockerfile).
- Awal: **2 instance**, masing-masing 2 vCPU / 2-4 GB RAM. Naikkan jumlah instance saat restock (scale out terjadwal, lihat OPERATIONS.md), bukan menunggu autoscale reaktif karena ledakan terjadi dalam hitungan detik.
- Konfigurasi koneksi database per instance dibatasi (`connection_limit` Prisma) agar total koneksi tidak melebihi kapasitas PgBouncer/Postgres.
- Pisahkan proses **worker** (job background) dari proses web. Jangan jalankan cron di dalam proses web (kalau 5 instance, job jalan 5 kali).

### 3.4 Database: PostgreSQL
- **PostgreSQL 16**, self-managed di VPS atau managed (DigitalOcean/Aiven/Neon/dll. kalau mau mengurangi beban operasional). Pilihan managed dengan backup PITR otomatis sangat layak untuk tim kecil.
- **Wajib PgBouncer** (mode `transaction`) di depan Postgres. Next.js dengan banyak instance dan serverless-style bisa menghabiskan `max_connections` dengan cepat.
  - Prisma + PgBouncer: `DATABASE_URL=...?pgbouncer=true&connection_limit=10` (lewat PgBouncer), `DIRECT_URL=` langsung ke Postgres (untuk migrasi). Skema Prisma sudah memakai `url` dan `directUrl`, jadi tidak perlu diubah.
- **Primary** untuk semua tulis dan baca yang butuh konsistensi (stok, order, pembayaran).
- **Read replica** (streaming replication) untuk katalog, pencarian, dan dashboard admin. Hati-hati: replica punya lag, jangan dipakai untuk membaca stok saat checkout.
- Spesifikasi awal primary: 4 vCPU, 8-16 GB RAM, SSD/NVMe. `shared_buffers` ~25% RAM, `max_connections` rendah (100-200) karena sudah ada PgBouncer.
- Aktifkan `pg_stat_statements`, `log_min_duration_statement`, dan `idle_in_transaction_session_timeout` (cegah transaksi menggantung menahan lock stok).
- **Backup:** base backup harian + arsip WAL kontinu ke object storage (pgBackRest atau WAL-G) untuk Point-In-Time Recovery. Uji restore berkala. Backup yang tidak pernah dites restore dianggap tidak ada.

### 3.5 Redis
Satu instance (dengan persistence AOF) untuk beberapa kegunaan terpisah:
- **Rate limiting** per IP dan per user (sliding window).
- **Gate stok** saat restock: counter atomik per produk yang menolak request sebelum menyentuh Postgres (detail di BACKEND.md).
- **Antrean / waiting room** untuk meratakan lonjakan checkout.
- **Cache** katalog dan hasil query panas.
- **Queue** BullMQ untuk worker.
- Sesi bila auth memakai sesi server-side.

Redis bukan sumber kebenaran: bila Redis hilang, sistem harus tetap benar (hanya lebih lambat/lebih banyak beban ke DB). Untuk produksi, pakai Redis dengan replika + Sentinel, atau managed Redis.

### 3.6 Object storage (gambar produk)
Kondisi sekarang: `app/api/upload/route.ts` menulis ke `public/uploads/` di disk container. Ini **tidak akan bekerja** dengan banyak instance (file hanya ada di satu container) dan hilang saat container dibuat ulang.

Rencana:
- Pakai storage S3-compatible. Pilihan:
  - **Cloudflare R2**: tanpa biaya egress, cocok dipasangkan dengan CDN Cloudflare. Pilihan default yang disarankan.
  - **MinIO** self-hosted: bila ingin semua di infrastruktur sendiri (tambah beban operasional dan perlu backup sendiri).
  - AWS S3 / Wasabi / Backblaze B2: alternatif.
- Upload dari admin sebaiknya lewat **presigned URL** (browser upload langsung ke bucket), sehingga file tidak lewat server app.
- Saat upload: validasi tipe dengan magic bytes (bukan hanya `file.type`), batasi ukuran, ganti nama file dengan UUID, dan buat varian ukuran (thumbnail/medium) agar halaman katalog ringan. Gambar disajikan lewat CDN dengan `Cache-Control: immutable`.
- Bucket publik-baca hanya untuk gambar produk. Bucket backup database **privat** dan terpisah.

### 3.7 Pembayaran: Xendit
- Dipakai lewat Invoice API (sudah ada di `lib/xendit.ts`). Uang pembeli **tidak pernah melewati server kita**; ia berpindah di sisi Xendit/bank/e-wallet. Karena itu "saldo terpotong tapi order gagal" ditangani lewat idempotency, webhook, dan rekonsiliasi, bukan lewat rollback uang. Lihat BACKEND.md bagian 5.
- Simpan secret di environment/secret manager, bukan di repo.
- Webhook URL harus stabil, HTTPS, dan sangat andal (lihat inbox pattern di BACKEND.md).

### 3.8 Observability
- **Metrics:** Prometheus + Grafana (atau Grafana Cloud). Pantau: RPS, p95/p99 latency, error rate, koneksi DB, lock wait, replication lag, ukuran antrean, hit rate Redis.
- **Log terstruktur** (JSON) dengan `requestId`, `userId`, `orderId`, dikirim ke Loki/ELK/layanan log.
- **Error tracking:** Sentry.
- **Uptime check** eksternal untuk beranda, `/api/health`, dan endpoint webhook.
- **Alert** (Telegram/WhatsApp/Slack): error rate > ambang, antrean job menumpuk, replica lag, disk > 80%, payment PENDING terlalu lama, selisih rekonsiliasi Xendit vs DB.

### 3.9 Keamanan
- Firewall: hanya LB yang bisa mengakses app; hanya app/worker yang bisa mengakses PgBouncer; Postgres/Redis tidak terbuka ke internet.
- TLS di mana-mana (Cloudflare ke LB, dan koneksi DB bila lintas host).
- Secret via Docker secrets / Vault / env terenkripsi. Rotasi kunci bila ada kebocoran.
- Rate limit login dan endpoint sensitif; proteksi bruteforce.
- Update OS dan image berkala; scan dependensi (`npm audit`, Dependabot).
- Hak akses DB minimal: user aplikasi tidak perlu superuser; user migrasi dipisah.

## 4. Sizing awal (titik mulai)

| Komponen | Jumlah | Spesifikasi awal | Catatan |
|---|---|---|---|
| Load balancer | 2 | 1-2 vCPU, 1-2 GB | atau LB terkelola |
| App (Next.js) | 2 normal, 4-8 saat restock | 2 vCPU, 2-4 GB | scale out terjadwal |
| Worker | 1-2 | 1 vCPU, 1-2 GB | job expire/rekonsiliasi/email |
| PgBouncer | 1 (bisa satu host dengan Postgres) | kecil | transaction mode |
| PostgreSQL primary | 1 | 4 vCPU, 8-16 GB, NVMe | |
| PostgreSQL replica | 1 | sama dengan primary | baca katalog/admin, failover manual |
| Redis | 1 (+ replika) | 1-2 GB RAM | AOF aktif |
| Object storage | 1 bucket publik + 1 bucket backup | | R2 / S3-compatible |

Untuk lokasi: pilih datacenter di Indonesia atau Singapura karena mayoritas pembeli di Indonesia. Provider yang umum dipertimbangkan: IDCloudHost, Biznet Gio, Dewacloud (lokal); Hetzner/DigitalOcean/Vultr (Singapura). Bandingkan harga dan SLA terbaru langsung dari provider.

## 5. Skala bertahap

1. **Tahap 1 (sekarang):** 1 VPS (app + Postgres + Redis lewat Docker Compose), Cloudflare di depan, R2 untuk gambar, backup ke object storage. Cukup untuk pengembangan dan beta kecil. Ini masih single point of failure.
2. **Tahap 2 (sebelum restock besar):** pisahkan DB ke host sendiri, 2+ app di belakang LB, PgBouncer, Redis, worker, monitoring, gate stok + rate limit aktif.
3. **Tahap 3 (bila perlu):** read replica, antrean checkout/waiting room penuh, scale out terjadwal 4-8 app, failover Postgres otomatis (Patroni) atau pindah ke managed DB.

Mulai dari tahap 2 sebelum menerima trafik nyata saat restock. Tahap 1 saja tidak cukup untuk skenario "berbondong-bondong checkout".

## 6. Deployment
- Image dibangun di CI (GitHub Actions) dan didorong ke registry; server hanya `docker compose pull && up -d`.
- **Rolling deploy:** ganti app satu per satu di belakang LB, jangan deploy saat jam restock.
- Migrasi database dijalankan terpisah sebelum rilis (`prisma migrate deploy`) dan harus **backward compatible** (tambah kolom dulu, hapus kolom di rilis berikutnya).
- Freeze deploy minimal beberapa jam sebelum dan sesudah restock.
- Catatan: `prisma/migrations/` saat ini ada di `.gitignore`. Untuk produksi, folder migrasi harus di-commit agar skema bisa direproduksi dan `migrate deploy` bisa dipakai.
