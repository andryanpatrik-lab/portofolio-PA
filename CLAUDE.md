# CLAUDE.md

## Proyek
Website portofolio Patrik Andryan (dwibahasa ID/EN).
Sumber kebenaran: `BRIEF.md` (desain, struktur, motion, acceptance criteria) dan `CONTENT.md` (semua teks dan data konten).
Jika ada konflik antara asumsi Anda dan kedua dokumen itu, ikuti dokumen dan tanyakan ke Patrik.

## Aturan keras
- Jangan menulis nama perusahaan, klien, atau kreator di mana pun (kode, komentar, nama file, metadata, pesan commit).
- Jangan menambah fitur di luar bagian "Yang TIDAK boleh dibuat" di `BRIEF.md`.
- Teks bertanda `[ISI: ...]` atau `[KONFIRMASI]` di `CONTENT.md` jangan diisi sendiri. Tampilkan teks sementara yang netral dan catat di `TODO.md`.
- Animasi hanya `transform` dan `opacity`. Tidak ada `transition: all`. Hormati `prefers-reduced-motion`.
- Efek hover hanya di `@media (hover: hover) and (pointer: fine)`.
- Tidak ada `.env`, token, atau kunci di repo. Tidak ada backend, database, atau CMS.
- Tema gelap saja. Maksimal 1 CTA emas per layar.

## Bahasa
Berkomunikasi dengan Patrik dalam Bahasa Indonesia. Kode, nama variabel, dan komentar dalam Bahasa Inggris.

## Alur kerja
- Satu milestone (M0 sampai M6 di `BRIEF.md` bagian 14) per sesi.
- Mulai dengan plan mode, tunggu persetujuan Patrik, lalu kerjakan.
- Commit setelah tiap milestone selesai, dengan pesan commit yang jelas.
- Setelah M0, lengkapi bagian Perintah di bawah.

## Perintah
- Dev: `npm run dev`
- Build: `npm run build` (static export ke `out/`)
- Lint: `npm run lint`
- Pratinjau hasil build: `npm start` (menyajikan `out/` dengan `serve`)
- Tidak ada test runner (belum dibutuhkan sampai M5).

## Arsitektur
- Next.js 16 App Router, **static export** (`output: 'export'`, `trailingSlash`). Tidak ada middleware atau fitur server. Deploy di Netlify (`netlify.toml`, publish `out`).
- Route berbasis locale: `src/app/[locale]/` (root layout ada di sini, mengatur `<html lang>`), `generateStaticParams` untuk `id` dan `en`, `dynamicParams = false`. `params` adalah Promise (Next 15+).
- Redirect `/` ke `/id/` atau `/en/` dilakukan di `netlify.toml` berdasarkan header bahasa, bukan di Next.
- i18n tanpa library: kamus di `content/{id,en}/*.json`, diakses lewat `getDictionary()` di `src/lib/i18n.ts` (alias `@content/*`). Tipe `Dictionary` diturunkan dari JSON `id`, jadi kunci di `en` harus sama.
- Design tokens (BRIEF bagian 7-8) ada di `src/app/globals.css` sebagai CSS variables, dipetakan ke tema Tailwind v4 lewat `@theme inline`. Kelas tipografi: `.t-display`, `.t-h1`..`.t-h4`, `.t-lead`, `.t-metric`, `.t-label`.
- Font self-host: berkas woff2 di `src/fonts/` dimuat lewat `next/font/local` (`src/app/fonts.ts`). Jangan memakai `next/font/google`.
- Hero reveal (M2): `src/components/HeroMotion.tsx` (client, GSAP + SplitText via `useGSAP`) menyasar elemen lewat atribut `data-hero`, sehingga Hero dan Nav tetap server component. Skrip inline di `<head>` (`src/lib/motionInit.ts`) memasang kelas `reveal-ready` (motion diizinkan) dan `hero-pending` (belum diputar di sesi ini, `sessionStorage` `hero-played`) di `<html>`; CSS menyembunyikan elemen `[data-hero]` dan `[data-reveal]` hanya di bawah kelas itu. Teks selalu ada di DOM. Pengaman CSS-only (`motion-failsafe`, 3 detik) hanya aktif selama `<html>` belum punya kelas `motion-active`, yang dipasang `HeroMotion` dan `RevealOnScroll` saat mount. Kata emas dibuat dua lapis (`.accent-base` + lapis emas `data-hero="gold"`) agar pergeseran warna hanya menganimasikan opacity. Ease `power4.out` dipakai sebagai pendekatan `--ease-out`. ScrollTrigger dan Flip belum dipasang.
- Reveal section (M2.5): `src/components/RevealOnScroll.tsx` (IntersectionObserver, tanpa GSAP) menambah kelas `is-in` pada elemen `[data-reveal]` (fade + naik 12px, 280ms, sekali). Tambahkan `data-reveal` pada elemen baru yang ingin ikut; jangan pada hero.
- `FlowDiagram` (`src/components/FlowDiagram.tsx`): HTML/CSS agar animasi hanya `transform` dan `opacity`. Varian `mini` dekoratif (`aria-hidden`, tanpa label) dipakai di `ProjectCard`; jumlah node dari `flowSteps` di `content/{id,en}/home.json`. Animasi nyala emas hanya saat hover pointer halus. Varian `full` berlabel menyusul di M3.
- Case study (M3): rute `src/app/[locale]/work/[slug]/`, data per slug di `content/{id,en}/case-studies.json` (judul dan tagline tetap dari `home.json`), layout di `CaseStudyLayout`. Morph kartu ke halaman memakai `<ViewTransition name="card-{num|title|flow}-<slug>" share="morph" default="none">` di kartu dan halaman; `<Link transitionTypes>` (`nav-forward` / `nav-back`) mengatur durasi (400ms / 280ms) lewat CSS di `globals.css`. Isi lain fade lewat `enter="page-in" exit="page-out"`. Jangan beri nama yang sama pada dua elemen di satu halaman. `RevealOnScroll` hanya memutar reveal pada pemuatan pertama; navigasi klien melepas `reveal-ready` supaya target morph tidak tersembunyi. `Nav` hanya memakai `heroReveal` di beranda. Pengujian morph harus di build produksi, bukan `npm run dev`.
- Tipografi: judul besar (Display, H1, H2) weight 300, H3 400, label mono tracking 0.16em. Space Grotesk dimuat 300/400/500, JetBrains Mono 500.
