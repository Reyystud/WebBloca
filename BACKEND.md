# BACKEND

Desain backend untuk dua masalah utama: **(1) lonjakan checkout saat restock tanpa overselling** dan **(2) kegagalan saat pembayaran tanpa membuat pembeli rugi**.

Baca bersama [INFRASTRUCTURE.md](INFRASTRUCTURE.md).

---

## 1. Temuan pada kode saat ini

Hasil review kode sebelum desain. Semua poin ini perlu diperbaiki sebelum trafik restock nyata.

| # | Lokasi | Masalah | Dampak |
|---|---|---|---|
| 1 | `app/api/orders/route.ts:58-66` | Stok dicek dengan `findUnique` lalu dikurangi dengan `update decrement` di transaksi biasa (isolation default Read Committed). Check dan write tidak atomik. | **Overselling.** Dua request bersamaan dengan stok 1 sama-sama lolos cek dan stok menjadi -1. |
| 2 | `app/api/orders/route.ts:65` | Stok dikurangi saat order dibuat, tetapi tidak ada yang mengembalikannya bila order kedaluwarsa, pembayaran gagal, atau dibatalkan (`app/api/admin/orders/[id]/route.ts` tidak me-restock). | Stok "bocor": barang tertahan oleh order yang tidak pernah dibayar, produk tampak habis padahal ada. Ini diperparah oleh bot. |
| 3 | `app/api/orders/route.ts:97` | Poin loyalti ditambahkan saat order dibuat, sebelum dibayar. | Poin bisa didapat dari order yang tidak pernah dibayar. |
| 4 | `app/api/orders/route.ts:56` | `shippingCost` diambil dari body request klien. | Klien bisa mengirim ongkir 0 atau nilai arbitrer. Harus dihitung server dari `ShippingRate`. |
| 5 | `app/api/payment/xendit-callback/route.ts:15-27` | Verifikasi webhook memakai HMAC-SHA256 terhadap body, padahal Xendit mengirim **callback token statis** pada header `x-callback-token`. Verifikasi juga **dilewati sepenuhnya bila `XENDIT_WEBHOOK_SECRET` kosong** (fail-open). | Webhook asli bisa ditolak, atau webhook palsu bisa diterima bila env tidak diset: penyerang bisa menandai order sebagai PAID. |
| 6 | `app/api/payment/xendit-callback/route.ts:44-86` | Tidak idempotent dan tidak menjaga urutan status: event `EXPIRED`/`FAILED` menimpa status tanpa mengecek apakah sudah `PAID`. Tidak ada pencatatan event. | Webhook ganda/terlambat bisa merusak status; tidak ada jejak audit. |
| 7 | `app/api/payment/create/route.ts` | Invoice Xendit dibuat dulu, baru dicatat ke DB, dalam dua tulisan terpisah tanpa transaksi. Tidak ada idempotency key. `externalId` konstan per order. | Klik ganda/retry bisa membuat invoice ganda atau invoice yatim (ada di Xendit, tidak ada di DB). Membuat ulang invoice setelah kedaluwarsa dengan `externalId` sama kemungkinan ditolak Xendit (duplicate), perlu diverifikasi. |
| 8 | `app/api/upload/route.ts` | Upload ke disk lokal; validasi tipe hanya dari `file.type` (dikirim klien). | Tidak jalan multi-instance; file bisa menyamar. Lihat INFRASTRUCTURE.md 3.6. |
| 9 | seluruh API | Tidak ada rate limiting. | Bot dapat membanjiri checkout. |
| 10 | `lib/auth.ts`, `proxy.ts` | Auth dan cek role bergantung pada Supabase (termasuk query PostgREST ke tabel `users` di `proxy.ts`). | Berhenti bekerja saat keluar dari Supabase. Lihat SUPABASE_MIGRATION.md. |

## 2. Model status

### Order
```
PENDING_PAYMENT --(bayar sukses)--> PAID --> PROCESSING --> SHIPPED --> DELIVERED
      |  \
      |   (expired / dibatalkan user)--> EXPIRED / CANCELLED   [stok dikembalikan tepat satu kali]
      |
      +--(bayar sukses SETELAH expired)--> lihat bagian 5.3 (re-alokasi atau refund)
```
Aturan: transisi status dilakukan dengan **compare-and-set** di SQL (`UPDATE ... WHERE id=$1 AND status='PENDING_PAYMENT' RETURNING ...`). Bila tidak ada baris yang berubah, transisi sudah dilakukan pihak lain dan operasi berhenti tanpa efek samping. Inilah yang membuat semua proses idempotent.

Tambahan skema yang dibutuhkan:
- `Order.expiresAt` (batas reservasi stok, mis. 15 menit).
- `Order.stockReleasedAt` (penanda stok sudah dikembalikan, mencegah restock ganda).
- Tabel `IdempotencyKey` (`userId`, `key`, `requestHash`, `response`, `status`, unik pada `(userId, key)`).
- Tabel `WebhookEvent` (`provider`, `eventId`/`externalId+status`, `payload`, `receivedAt`, `processedAt`, unik per event).
- Tabel `LoyaltyLedger` (append-only) bila poin/saldo internal dipakai, lihat bagian 6.
- Constraint DB: `CHECK (stock >= 0)` pada `products` sebagai pagar terakhir. Kalau logika aplikasi salah, DB menolak, bukan diam-diam menjadi negatif.

## 3. Race condition stok

### 3.1 Dasar: pengurangan stok atomik di satu statement
Jangan "baca lalu tulis". Tulis dengan kondisi:

```sql
UPDATE products
SET stock = stock - $qty
WHERE id = $id AND stock >= $qty AND is_deleted = false;
-- rowCount = 0  =>  stok habis (atau produk dihapus). Batalkan seluruh order.
```

Dengan Prisma:

```ts
const res = await tx.product.updateMany({
  where: { id: item.productId, isDeleted: false, stock: { gte: item.quantity } },
  data: { stock: { decrement: item.quantity } },
})
if (res.count === 0) throw new SoldOutError(item.productId)
```

Postgres mengunci baris saat `UPDATE`; request kedua menunggu, lalu mengevaluasi ulang `WHERE stock >= qty` dengan nilai terbaru. Hanya satu yang menang untuk stok terakhir. Ini menutup overselling tanpa perlu isolation `SERIALIZABLE`.

Aturan tambahan:
- **Urutkan** `productId` sebelum memproses banyak item dalam satu order, agar dua order yang berisi produk sama dalam urutan berbeda tidak deadlock.
- Seluruh pengurangan stok + pembuatan order + pengosongan cart dalam **satu transaksi**. Gagal di tengah berarti semuanya rollback.
- Tangani error `P2034`/deadlock dengan retry terbatas (mis. 2-3 kali dengan jitter).
- Set `statement_timeout` dan `lock_timeout` pendek (mis. 3-5 detik) untuk jalur checkout supaya antrean lock tidak menggantung.

### 3.2 Reservasi dengan batas waktu
Stok dikurangi saat order dibuat (reservasi), tetapi harus bisa kembali:
- Order dibuat dengan `expiresAt = now() + 15 menit`.
- Invoice Xendit dibuat dengan durasi **tidak lebih lama** dari `expiresAt` (lihat 5.3).
- Worker menjalankan job tiap menit:

```sql
-- 1) klaim order yang kedaluwarsa (CAS, aman dijalankan paralel)
UPDATE orders
SET status = 'EXPIRED', stock_released_at = now()
WHERE status = 'PENDING_PAYMENT' AND expires_at < now() AND stock_released_at IS NULL
RETURNING id;

-- 2) untuk tiap id yang berhasil diklaim, kembalikan stok dari order_items
UPDATE products p SET stock = stock + oi.quantity
FROM order_items oi WHERE oi.order_id = $1 AND oi.product_id = p.id;
```
Langkah 1 dan 2 dalam satu transaksi. Karena `stock_released_at` hanya bisa diisi sekali lewat CAS, stok tidak mungkin dikembalikan dua kali. Pembatalan manual oleh user/admin memakai fungsi yang sama.

Hal ini juga membatasi kerusakan bot: stok yang ditahan bot kembali otomatis. Tetap tambahkan batas (mis. maksimal N unit per produk per akun, maksimal 1 order PENDING_PAYMENT aktif per akun saat restock).

### 3.3 Masalah "hot row" saat ribuan orang membeli satu produk
Pengurangan atomik benar tetapi tidak cepat untuk satu baris yang diperebutkan ribuan transaksi: semuanya mengantre di lock baris yang sama, koneksi DB habis, latency melonjak. Solusinya berlapis, urut dari yang paling murah:

1. **Gate di Redis (pintu depan).** Saat restock, admin/worker memuat jumlah stok ke Redis. Setiap request checkout melakukan pengurangan atomik di Redis lebih dulu:

   ```lua
   -- KEYS[1] = stock:{productId}, ARGV[1] = qty
   local s = tonumber(redis.call('GET', KEYS[1]) or '0')
   if s >= tonumber(ARGV[1]) then
     redis.call('DECRBY', KEYS[1], ARGV[1]); return 1
   end
   return 0
   ```
   Hasil `0` langsung dijawab "stok habis" tanpa menyentuh Postgres. Hanya pemenang yang lanjut ke langkah 3.1. Karena jumlah pemenang paling banyak sama dengan stok (mis. 200), beban tulis ke DB turun drastis dibanding puluhan ribu percobaan.
   - Postgres tetap penentu akhir. Redis hanya penyaring. Bila order gagal dibuat (error, expired), kembalikan hitungan Redis (`INCRBY`).
   - Rekonsiliasi berkala: sinkronkan counter Redis dari Postgres. Bila Redis hilang, isi ulang dari DB; sementara itu sistem tetap benar karena 3.1 menjaga kebenaran.
2. **Antrean / waiting room.** Untuk lonjakan yang jauh melebihi kapasitas, tampilkan antrean: user masuk antrean (Redis list/sorted set atau layanan waiting room Cloudflare), dilepas ke checkout dalam batch sesuai kapasitas. Frontend polling status posisi. Ini mengubah ledakan menjadi aliran yang bisa ditangani.
3. **Pemrosesan lewat queue (opsional, tahap lanjut).** Checkout hanya menaruh permintaan ke BullMQ dan langsung membalas "sedang diproses"; worker dengan konkurensi terbatas yang menulis ke DB. Hasil diambil lewat polling/SSE. Memberi back-pressure alami, tetapi menambah kompleksitas UX; pakai bila 1 dan 2 tidak cukup.
4. **Pecah stok (sharding stok)** untuk produk sangat panas: bagi stok ke beberapa baris/bucket. Kompleks; hanya bila terbukti perlu lewat load test.

### 3.4 Pelindung lain
- **Rate limit** per IP dan per user pada `/api/orders` dan `/api/payment/create` (Cloudflare + Redis).
- **Turnstile/captcha** di login dan sebelum checkout saat restock.
- **Idempotency-Key** pada pembuatan order (bagian 4) agar klik ganda/retry jaringan tidak membuat order ganda.
- **Pre-check murah:** endpoint `GET /api/products` boleh menampilkan stok dari cache; tombol beli dinonaktifkan saat habis. Tetapi keputusan akhir selalu di 3.1.

## 4. Idempotency untuk operasi tulis penting

Klien mengirim header `Idempotency-Key: <uuid>` (dibuat saat user membuka halaman checkout, dipakai ulang pada retry). Server:

1. Mencoba `INSERT` ke `idempotency_keys (user_id, key, request_hash, status='IN_PROGRESS')`.
2. Bila konflik: bila `COMPLETED`, kembalikan respons tersimpan yang sama; bila `IN_PROGRESS`, balas `409` + `Retry-After`; bila `request_hash` berbeda, balas `422` (kunci dipakai ulang untuk request berbeda).
3. Bila sukses, simpan respons dan tandai `COMPLETED` dalam transaksi yang sama dengan pembuatan order.
4. Kunci kedaluwarsa setelah 24 jam (job pembersih).

Terapkan di `POST /api/orders` dan `POST /api/payment/create`.

## 5. Pembayaran gagal: pembeli tidak boleh rugi

### 5.1 Fakta penting
Aplikasi ini **tidak menyimpan saldo uang**. Uang berpindah di sisi Xendit/bank/e-wallet saat user membayar di halaman invoice Xendit. Maka pertanyaannya bukan "bagaimana rollback saldo", melainkan:

> Bagaimana memastikan **setiap pembayaran yang sukses di Xendit selalu berujung pada order yang tercatat sebagai dibayar**, dan **setiap pembayaran yang tidak bisa dipenuhi selalu di-refund**?

Prinsip: **webhook adalah pemberitahuan, bukan satu-satunya sumber kebenaran.** Status akhir harus bisa dipulihkan lewat rekonsiliasi.

### 5.2 Alur pembuatan pembayaran (perbaikan `payment/create`)
1. Validasi: order milik user, status `PENDING_PAYMENT`, belum kedaluwarsa, belum `PAID`.
2. Dalam transaksi DB: buat baris `payments` berstatus `CREATING` dengan `xenditExternalId` **deterministik dan unik per percobaan**, mis. `bloca-{orderId}-{attempt}`, plus `Idempotency-Key`.
3. Panggil Xendit membuat invoice menggunakan `externalId` tersebut dan `invoiceDuration` sesuai sisa waktu `expiresAt`.
4. Update `payments` menjadi `PENDING` dengan `xenditInvoiceId` dan `paymentUrl`.
5. Bila langkah 3 gagal/timeout: baris `CREATING` ditangani worker (cek ke Xendit berdasarkan `externalId` apakah invoice sempat terbentuk; bila ya, lengkapi data; bila tidak, tandai `FAILED`). **Tidak ada uang yang berpindah di fase ini**, karena user baru membayar setelah menerima `paymentUrl`.
6. Hanya satu invoice aktif per order pada satu waktu. Klik "bayar" kedua mengembalikan invoice yang sama.

### 5.3 Skenario kegagalan dan penanganannya

| Skenario | Apa yang terjadi | Penanganan |
|---|---|---|
| Xendit API gagal saat membuat invoice | Tidak ada invoice, tidak ada uang bergerak | Respons error ke user; order tetap tereservasi sampai `expiresAt`; user bisa mencoba lagi (idempotent). Worker membereskan baris `CREATING` yatim. |
| User membayar, tetapi **webhook tidak sampai** (server down/deploy/jaringan) | Uang sudah di Xendit, order masih `PENDING_PAYMENT` | (a) Xendit melakukan retry webhook (cek konfigurasi retry di dashboard/dokumentasi terbaru). (b) **Job rekonsiliasi** tiap 1-2 menit: ambil semua `payments` berstatus `PENDING` yang lebih tua dari 2 menit, `GET` invoice ke Xendit, dan terapkan hasilnya dengan fungsi yang sama dengan webhook. Ini jaring pengaman utama. |
| Webhook sampai, tetapi **DB error / app crash** saat memproses | Event hilang bila hanya diproses inline | **Inbox pattern**: segera `INSERT` ke `webhook_events` (cepat, sederhana), balas `200`, lalu proses lewat queue dengan retry. Bila bahkan insert gagal, balas `5xx` supaya Xendit mengirim ulang. |
| Webhook dikirim **dua kali** / tidak berurutan | Risiko double-process atau status mundur | Unique pada event; transisi lewat CAS (`WHERE payment_status <> 'PAID'`); status `PAID` tidak pernah ditimpa `EXPIRED`/`FAILED`. |
| User membayar **setelah order kedaluwarsa** (stok sudah dikembalikan) | Uang masuk untuk order yang sudah tidak terjamin | Pencegahan: durasi invoice Xendit ≤ sisa `expiresAt`, sehingga setelah itu invoice tidak bisa dibayar. Bila tetap terjadi (race di batas waktu): coba **re-alokasi stok atomik** (3.1) dan pulihkan order ke `PAID`; bila stok sudah habis, **otomatis refund** lewat Xendit Refund API dan beri tahu user via email. Catat di `payment_events`/audit. |
| Pembayaran ganda untuk satu order (dua invoice dibayar) | Uang lebih dari yang seharusnya | Satu invoice aktif per order (5.2.6). Bila terjadi, pembayaran kedua otomatis di-refund. |
| Jumlah dibayar ≠ jumlah order | Anomali | Webhook memvalidasi `amount` terhadap `payments.amount`; bila berbeda, tandai `NEEDS_REVIEW` dan alert, jangan otomatis `PAID`. |
| Aplikasi atau Redis/DB mati lama saat restock | Pembayaran terus masuk di Xendit | Karena rekonsiliasi dan retry webhook, semua pembayaran akan terproses setelah sistem pulih. Itulah alasan status final dipulihkan dari Xendit, bukan hanya dari webhook. |
| User menutup tab saat membayar | Halaman sukses tidak pernah dimuat | Halaman sukses/gagal hanya tampilan. Status order ditentukan webhook/rekonsiliasi. Halaman sukses boleh memicu cek status (polling `GET /api/payment/[id]`) tetapi tidak mengubah status berdasarkan query string. |

### 5.4 Pemrosesan hasil pembayaran (satu fungsi untuk webhook DAN rekonsiliasi)
```
applyPaymentResult(externalId, xenditStatus, paidAmount):
  BEGIN
    payment = SELECT ... FROM payments WHERE external_id = $1 FOR UPDATE
    jika payment.status sudah final (PAID/REFUNDED) -> COMMIT, return   // idempotent
    validasi paidAmount == payment.amount, kalau tidak -> NEEDS_REVIEW
    jika xenditStatus == PAID:
        jika order.status == PENDING_PAYMENT:
            order -> PAID (lalu PROCESSING), payment -> PAID, tambah poin (ledger)
        jika order.status in (EXPIRED, CANCELLED):
            coba re-alokasi stok atomik; berhasil -> order PAID; gagal -> enqueue REFUND
    jika EXPIRED/FAILED dan payment belum PAID:
        payment -> EXPIRED/FAILED  (order dibiarkan sampai job expire / user buat invoice baru)
  COMMIT
```
Webhook memanggil fungsi ini setelah verifikasi; job rekonsiliasi memanggil fungsi yang sama. Satu jalur kode berarti satu perilaku yang bisa diuji.

### 5.5 Verifikasi webhook (perbaikan keamanan)
- Bandingkan header `x-callback-token` dengan token verifikasi Xendit memakai perbandingan **constant-time** (`crypto.timingSafeEqual`).
- **Fail-closed:** bila token tidak dikonfigurasi di environment, aplikasi menolak start (atau menolak semua webhook), tidak melewati verifikasi.
- Opsional: batasi sumber IP ke daftar IP Xendit di level LB/WAF.
- Jangan percaya field di body untuk menentukan jumlah/ order tanpa mencocokkan dengan data di DB.
- Setelah webhook diterima, untuk keamanan ekstra boleh melakukan `GET` invoice ke Xendit untuk mengonfirmasi status sebelum menandai `PAID`.

### 5.6 Refund
- Tabel `refunds` (`paymentId`, `amount`, `reason`, `status`, `xenditRefundId`, idempotency key). Refund dikirim lewat job dengan retry dan idempotency, tidak inline di request.
- Alert bila refund `PENDING` > 24 jam.

## 6. Saldo, poin, dan ledger
Saat ini poin ditambah langsung pada `User.points` ketika order dibuat. Perbaikan:
- Berikan poin **setelah** pembayaran `PAID`, di transaksi yang sama dengan perubahan status (lihat 5.4).
- Catat setiap perubahan di tabel `loyalty_ledger` yang **append-only** (`userId`, `delta`, `reason`, `orderId`, unik pada `(orderId, reason)`), dan hitung `points` dari ledger atau perbarui bersamaan dalam transaksi. Unik `(orderId, reason)` mencegah poin diberikan dua kali.
- Bila kelak ada saldo/wallet internal (top-up, kredit refund), perlakukan sama: ledger append-only, tidak pernah `UPDATE balance` tanpa baris ledger, dengan constraint `balance >= 0`.

## 7. Alur checkout target

```
1. Klien: POST /api/orders  (Idempotency-Key, cart server-side)
2. Server: auth -> rate limit -> idempotency check
3. Server: gate stok Redis (opsional, saat restock)  -> habis? 409 SOLD_OUT
4. Server: TX { kurangi stok atomik per item (urut id), buat order PENDING_PAYMENT + expiresAt,
               hitung total & ongkir di server, kosongkan cart, simpan idempotency response }
5. Klien: POST /api/payment/create (Idempotency-Key) -> paymentUrl
6. Klien: redirect ke Xendit, user membayar
7. Xendit -> webhook -> verifikasi -> simpan event -> applyPaymentResult()
   (+ job rekonsiliasi sebagai jaring pengaman)
8. Klien: halaman sukses melakukan polling status order, bukan mengandalkan redirect
9. Worker: expire order tak terbayar -> stok kembali; refund otomatis bila perlu; email notifikasi
```

## 8. Daftar pekerjaan (urutan prioritas)

1. Ganti pengurangan stok menjadi atomik + `CHECK (stock >= 0)` (3.1). **Kritis.**
2. Perbaiki verifikasi webhook fail-closed dengan `x-callback-token` (5.5). **Kritis (keamanan).**
3. `expiresAt`, status `PENDING_PAYMENT`/`EXPIRED`, job expire + restock sekali (3.2).
4. Tabel `webhook_events`, `applyPaymentResult` idempotent, rekonsiliasi (5.3, 5.4).
5. Idempotency key pada order dan payment (4, 5.2).
6. Ongkir dihitung server, poin setelah PAID (temuan 3 dan 4).
7. Object storage untuk upload (INFRASTRUCTURE.md 3.6).
8. Rate limiting + Turnstile + batas per akun.
9. Gate stok Redis + waiting room (3.3).
10. Refund otomatis + ledger poin (5.6, 6).
11. Pengganti auth Supabase (SUPABASE_MIGRATION.md).
12. Health endpoint, logging terstruktur, metrik, load test (OPERATIONS.md).
