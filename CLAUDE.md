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
- Dev: (isi setelah M0)
- Build: (isi setelah M0)
- Lint: (isi setelah M0)
