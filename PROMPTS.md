# PROMPTS: salin satu per sesi

Cara pakai: masuk ke folder proyek, jalankan `claude`, tekan Shift+Tab sampai plan mode, tempel prompt, tinjau rencana, setujui, lalu commit. Pakai `/clear` antar milestone.

## Sesi 0: pembuka (sekali saja)
```
Baca CLAUDE.md, BRIEF.md, dan CONTENT.md sepenuhnya. Ringkas pemahamanmu dalam 10 baris dan daftar pertanyaan dari "Item terbuka" yang menghalangi pekerjaan. Jangan menulis kode.
```

## M0: fondasi
```
Kerjakan M0 saja: setup Next.js (App Router) + TypeScript + Tailwind, design tokens (BRIEF bagian 7), font self-host (bagian 8), skeleton i18n /id dan /en dengan toggle. Lengkapi bagian Perintah di CLAUDE.md. Jangan mengerjakan milestone lain.
```

## M1: section statis
```
Kerjakan M1: semua section statis sesuai wireframe BRIEF bagian 6 (Hero, Posisi, Selected Work 4 kartu, Proyek lainnya, Tentang, Kontak), memakai teks dari CONTENT.md. Tanpa animasi dulu. Teks [ISI] ditampilkan netral dan dicatat di TODO.md.
```

## M2: hero
```
Kerjakan M2: Hero Cinematic Reveal sesuai tabel motion BRIEF bagian 9, sekali per sesi, teks ada di DOM sejak awal, plus fallback prefers-reduced-motion. Gunakan GSAP dan SplitText.
```

## M3: case study dan morph
```
Kerjakan M3: template halaman case study dan Morph Transition dari kartu ke halaman, dengan fallback crossfade. Bandingkan View Transitions API vs GSAP Flip, pilih yang andal di Chrome, Safari, dan Firefox terbaru, dan jelaskan alasannya di README.
```

## M4: konten final
```
Kerjakan M4: integrasikan konten final ID dan EN untuk 4 case study dan 5 kartu Proyek lainnya dari CONTENT.md. Jangan mengisi bagian [ISI]; catat di TODO.md. Pastikan toggle bahasa tersimpan.
```

## M5: aksesibilitas dan performa
```
Kerjakan M5: audit aksesibilitas (kontras, keyboard, fokus, reduced-motion) dan performa (LCP, CLS, ukuran bundle). Perbaiki temuan dan laporkan angka sebelum dan sesudah.
```

## M6: siap deploy
```
Kerjakan M6: metadata per locale, sitemap, hreflang, OG image sederhana, README (cara menjalankan, keputusan teknis), dan pemeriksaan akhir: cari nama perusahaan/klien/kreator di seluruh repo dan hasil build, serta sisa [ISI atau [KONFIRMASI di tampilan.
```
