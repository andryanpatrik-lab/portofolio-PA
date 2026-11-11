# Portofolio Patrik Andryan

Website portofolio dwibahasa (ID/EN), tema gelap. Next.js (App Router) dengan static export, di-deploy di Vercel (konfigurasi Netlify tetap ada sebagai cadangan).
Sumber kebenaran desain dan konten: `BRIEF.md` dan `CONTENT.md`.

## Menjalankan

```bash
npm install
npm run dev      # pengembangan
npm run build    # static export ke out/
npm start        # sajikan out/ untuk pratinjau build produksi
npm run lint
```

Uji transisi antar halaman di build produksi (`npm run build && npm start`), bukan di `npm run dev`: transisi memerlukan halaman yang sudah di-prefetch.

## Struktur singkat

- `src/app/[locale]/` halaman utama dan `work/[slug]/` (case study), locale `id` dan `en`.
- `content/{id,en}/*.json` semua teks; `content/site.json` tautan kontak dan berkas CV (kosong sampai data tersedia).
- `src/components/` komponen dan section; `src/lib/` i18n dan skrip inisialisasi motion.
- `TODO.md` daftar data yang masih ditunggu dan teks sementara yang dipakai.

## Keputusan teknis

### Static export
Situs sepenuhnya statis (konten berupa berkas lokal, tanpa backend), jadi tidak butuh adapter SSR. Redirect `/` ke `/id/` atau `/en/` dilakukan di `netlify.toml` berdasarkan bahasa browser.

### Morph Transition kartu ke halaman case study: View Transitions API
Dibandingkan dua pendekatan:

| | View Transitions API (dipilih) | GSAP Flip |
|---|---|---|
| Lintas route | Browser mengambil snapshot halaman lama dan baru, otomatis | Perlu serah-terima state antar halaman dan menunggu halaman baru mount; rapuh terhadap navigasi App Router |
| Biaya | 0 KB JS tambahan (React 19.3 `<ViewTransition>` sudah ada di Next 16) | ±25 KB gzip |
| Kontrol | Lewat CSS pseudo-element, terbatas | Presisi tinggi |
| Dukungan | Chromium, Safari, dan Firefox versi terbaru | Semua browser |
| Kelemahan | Teks saat morph adalah gambar yang diskalakan, jadi sedikit blur di tengah gerakan | Kode lebih banyak, risiko flicker saat route berganti |

Alasan memilih View Transitions: bekerja lintas route tanpa kode serah-terima, tanpa bundle tambahan, dan didukung langsung oleh React di Next. Elemen yang berpindah: nomor kartu, judul, dan diagram alur. Durasi masuk 400ms, kembali 280ms (`ease-in-out`), isi lain fade 200ms mulai 200ms.

Fallback:
- `prefers-reduced-motion`: tanpa morph, crossfade 150ms.
- Browser tanpa API: skrip di `<head>` memasang kelas `no-vt` dan halaman fade-in 200ms lewat CSS.

Catatan: aturan proyek "animasi hanya `transform` dan `opacity`" berlaku untuk animasi buatan sendiri. Grup morph milik browser menganimasikan ukuran snapshot, ini pengecualian yang disengaja.

Status pengujian: sudah diuji di Chromium. Safari dan Firefox belum diuji (belum tersedia di lingkungan pengembangan); periksa di perangkat nyata sebelum tayang.

### SEO dan metadata
- Judul, deskripsi, `canonical`, `hreflang` (`id`, `en`, `x-default`), Open Graph, dan Twitter card dibuat per halaman lewat `src/lib/seo.ts`. `sitemap.xml` dan `robots.txt` dibuat saat build.
- URL absolut berasal dari `src/lib/site.ts`: variabel `SITE_URL`, lalu `VERCEL_PROJECT_PRODUCTION_URL`, lalu `URL` bawaan Netlify. Hanya build produksi yang boleh diindeks (`VERCEL_ENV` atau `CONTEXT` bernilai `production`); preview otomatis `noindex`.
- Hanya deploy production (`CONTEXT=production`) yang boleh diindeks. Branch deploy dan deploy preview otomatis `noindex` dan `robots.txt` melarang semua.
- Gambar OG `public/og.png` dibuat dari `scripts/og.html` (screenshot 1200x630 dengan browser headless, font dari `@fontsource`). Ubah templat, lalu render ulang.
- Halaman 404 dwibahasa: `src/app/global-not-found.tsx` (memakai `experimental.globalNotFound` karena root layout berada di bawah `[locale]`). Bila flag ini berubah di versi Next berikutnya, Netlify tetap menyajikan `404.html`.

### Motion lain
Hero reveal memakai Motion (sekali per sesi), reveal section memakai IntersectionObserver. Semua keadaan awal tersembunyi punya pengaman CSS agar konten tidak pernah tertahan. Detail ada di `CLAUDE.md`.

## Deploy di Vercel

1. Impor repo di Vercel (Add New, Project). Preset **Next.js** terdeteksi otomatis; bila tidak, set Output Directory ke `out`.
2. Environment variable `SITE_URL` berisi alamat final (mis. `https://namadomain.com`, tanpa garis miring di akhir), lalu deploy ulang karena nilai dibaca saat build.
3. Redirect `/` berdasarkan bahasa browser dan header cache/keamanan ada di `vercel.json`.
4. Production Branch: pilih branch yang hanya Anda gabung bila sudah siap, supaya tiap push tidak menjadi deploy produksi.
5. Pastikan Deployment Protection tidak menutup lingkungan Production (Settings, Deployment Protection).
6. Paket Hobby hanya untuk penggunaan non-komersial; portofolio yang dipakai mencari klien sebaiknya di paket Pro.

## Deploy di Netlify (cadangan)

- Build command `npm run build`, publish directory `out`, Node 22 (sudah diatur di `netlify.toml`).
- Variabel lingkungan: `SITE_URL` berisi alamat final (mis. `https://namadomain.com`, tanpa garis miring di akhir). Ubah variabel lalu deploy ulang, karena nilai dibaca saat build.
- Redirect `/` berdasarkan bahasa browser, header cache untuk `/_next/static/*`, dan header keamanan dasar ada di `netlify.toml`.

## Sebelum publik

1. Isi `content/site.json` (email, LinkedIn, GitHub, WhatsApp, berkas CV di `public/`). Tombol dan tautan yang kosong otomatis disembunyikan.
2. Selesaikan konten final (lihat `TODO.md`) dan konten `case-studies.json` serta `home.json`.
3. Tentukan domain dan isi `SITE_URL`.
4. Pastikan situs produksi tidak dilindungi (Vercel: Deployment Protection; Netlify: Access control) agar bisa dibuka publik.
5. Jalankan pemeriksaan akhir di `TODO.md` bagian "Sebelum publik".
