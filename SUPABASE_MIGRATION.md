# SUPABASE MIGRATION

Langkah keluar dari Supabase karena batas (limit) plan. Perlu diingat bahwa Supabase di proyek ini dipakai untuk **tiga hal berbeda**, dan masing-masing perlu pengganti sendiri:

| Fungsi di Supabase | Dipakai di | Pengganti |
|---|---|---|
| **Database Postgres** | Prisma (`DATABASE_URL`, `DIRECT_URL`) | PostgreSQL sendiri / managed (lihat INFRASTRUCTURE.md 3.4) |
| **Auth** (login/register, sesi, JWT) | `lib/auth.ts`, `lib/supabase/*`, `context/auth-context.tsx`, `app/api/auth/route.ts`, `proxy.ts` | Auth sendiri (lihat bagian 3) |
| **RLS + trigger** | `supabase-setup.sql` (policy RLS, trigger auto-create profile saat signup) | Otorisasi di lapisan aplikasi + hak akses DB |

Database saja bisa dipindah dengan mudah. **Auth adalah bagian yang paling banyak membutuhkan kerja**, karena seluruh `requireAuth`/`requireAdmin` dan `proxy.ts` bergantung pada Supabase.

## 1. Urutan yang disarankan

1. **Pindahkan database dulu**, auth masih Supabase (sementara).
2. **Ganti auth.**
3. Matikan ketergantungan Supabase (hapus paket dan env).

Dengan urutan ini setiap langkah bisa diuji terpisah dan ada jalan mundur.

## 2. Memindahkan database

1. Siapkan Postgres tujuan (versi 15/16) dan PgBouncer. Buat user aplikasi dan user migrasi terpisah.
2. Dump dari Supabase (hanya skema `public`):
   ```bash
   pg_dump "$SUPABASE_DIRECT_URL" --schema=public --no-owner --no-privileges -Fc -f bloca.dump
   pg_restore --no-owner -d "$NEW_DATABASE_DIRECT_URL" bloca.dump
   ```
   Perhatikan: tabel `users` Anda memiliki `id` yang sama dengan `auth.users.id` Supabase. Data pengguna (email, nama, poin, tier) ada di tabel `public.users`, sedangkan **password hash ada di `auth.users`** (di luar skema `public`).
3. Jangan bawa objek khusus Supabase: policy RLS, trigger `auth.users`, fungsi yang mereferensikan `auth.uid()`. Dari `supabase-setup.sql`, hanya ambil bagian yang murni skema bila perlu; skema tabel sudah didefinisikan Prisma.
4. Terapkan skema lewat Prisma bila memulai dari kosong: commit folder `prisma/migrations/` (sekarang ada di `.gitignore`, hapus entri itu), lalu `prisma migrate deploy`. Bila memulai dari dump, lakukan `prisma migrate resolve --applied <baseline>` setelah membuat migrasi baseline.
5. Ubah env:
   ```
   DATABASE_URL="postgresql://app_user:...@pgbouncer-host:6432/bloca?pgbouncer=true&connection_limit=10"
   DIRECT_URL="postgresql://migrate_user:...@postgres-host:5432/bloca"
   ```
6. Tambahkan constraint dan indeks yang direncanakan di BACKEND.md (`CHECK (stock >= 0)`, tabel idempotency/webhook/ledger).
7. Freeze tulis sebentar saat cutover: tampilkan mode maintenance, dump final, restore, ganti env, deploy, verifikasi jumlah baris tiap tabel sebelum dan sesudah.

## 3. Mengganti Auth

### 3.1 Pilihan
- **Better Auth** atau **Auth.js (NextAuth)** dengan adapter Prisma: sesi tersimpan di Postgres (atau Redis), cocok untuk Next.js App Router, tanpa layanan eksternal. **Disarankan.**
- **Self-host Supabase Auth (GoTrue)**: perubahan kode minimal, tetapi Anda menjalankan service tambahan dan tetap terikat ekosistem Supabase.
- **Layanan auth pihak ketiga** (Clerk, Auth0, dll.): paling cepat, tetapi ada biaya dan limit sendiri, yang justru ingin dihindari.

Pilih satu sebelum mulai; sisa dokumen mengasumsikan Better Auth/Auth.js dengan sesi di database.

### 3.2 Yang perlu diubah di kode
| File | Perubahan |
|---|---|
| `lib/auth.ts` | `getAuthUser()` membaca sesi dari library auth baru, bukan `supabase.auth.getUser()`. `requireAuth` dan `requireAdmin` tetap sebagai antarmuka sehingga route API tidak perlu diubah. `requireAdmin` cukup membaca `role` dari tabel `users` lewat Prisma (sudah begitu). |
| `proxy.ts` | Hapus klien Supabase dan query `from('users')` (PostgREST). Cek sesi dari cookie via library auth. Untuk cek role admin, **jangan** query DB di tiap request di proxy; cukup cek login di proxy dan pastikan role di layout/route admin (server-side) lewat `requireAdmin()`. |
| `app/api/auth/route.ts` | Logika "pastikan profil ada" digantikan oleh hook/callback pendaftaran auth baru (buat baris `users` saat register), sehingga trigger SQL Supabase tidak diperlukan. |
| `context/auth-context.tsx`, `lib/supabase/client.ts`, `lib/supabase/server.ts` | Ganti dengan klien auth baru, hapus `lib/supabase/*`. |
| halaman `app/auth/*` | Sambungkan form login/register ke API auth baru. |
| `package.json` | Hapus `@supabase/ssr` dan `@supabase/supabase-js` setelah semua referensi hilang. |
| env | Hapus `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`; tambah `AUTH_SECRET` dan URL situs. Perbarui `Dockerfile`/`docker-compose.yml` (build arg `NEXT_PUBLIC_SUPABASE_*` tidak diperlukan lagi). |

### 3.3 Migrasi pengguna dan password
Password hash Supabase (bcrypt) ada di `auth.users.encrypted_password`. Dua opsi:
- **Migrasi hash (disarankan):** ekspor `id`, `email`, `encrypted_password`, `email_confirmed_at` dari `auth.users`; impor ke tabel akun library auth baru. Supabase memakai bcrypt, yang kompatibel dengan banyak library (proyek ini sudah memiliki `bcryptjs`). Pengguna login dengan password lama tanpa melakukan apa pun. Pertahankan `id` yang sama agar relasi (`orders.userId`, `cart_items.userId`, dll.) tidak putus.
- **Paksa reset password:** impor pengguna tanpa hash, kirim email reset. Lebih aman secara kompatibilitas, tetapi menambah gesekan bagi pembeli lama.

Akun login via OAuth (Google, dll.) perlu dikonfigurasi ulang di provider baru; tautkan berdasarkan email.

## 4. RLS hilang: apa penggantinya
Dengan Supabase, RLS melindungi data meskipun klien memanggil database langsung. Setelah migrasi, **klien tidak pernah berbicara ke database langsung**; semua lewat API Next.js. Karena itu:
- Otorisasi dilakukan di kode: tiap route memanggil `requireAuth()`/`requireAdmin()` dan **selalu memfilter dengan `userId` sesi** (pola yang sudah dipakai di route orders/cart).
- Audit semua query Prisma agar tidak ada yang mengambil data tanpa filter kepemilikan.
- Bila ingin pertahanan berlapis, RLS Postgres tetap bisa dipakai dengan `SET LOCAL app.user_id`, tetapi menambah kompleksitas; cukup dipertimbangkan bila ada banyak consumer DB.
- Batasi hak user DB aplikasi (bukan superuser, tanpa `CREATE`/`DROP`).

## 5. Checklist selesai
- [ ] Postgres + PgBouncer berjalan, backup dan uji restore selesai
- [ ] Data `public` termigrasi, jumlah baris cocok
- [ ] `prisma/migrations/` di-commit, `migrate deploy` berjalan di CI/deploy
- [ ] Auth baru berjalan, password lama bisa login (atau reset terkirim)
- [ ] Semua route admin dan `/account` terlindungi (uji tanpa login, user biasa, admin)
- [ ] Tidak ada impor `@supabase/*` tersisa (`grep -r supabase app lib context components`)
- [ ] Env, Dockerfile, README diperbarui
- [ ] Project Supabase dijeda/dihapus **setelah** periode pengamatan dan backup final tersimpan
