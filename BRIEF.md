# BRIEF: Website Portofolio Patrik Andryan

> Dokumen ini adalah sumber kebenaran untuk membangun website. Baca bersama `CONTENT.md` (seluruh teks dwibahasa).
> Kalau ada konflik antara dokumen ini dan asumsi Anda, **ikuti dokumen ini** dan catat pertanyaan di bagian "Item terbuka".

---

## 1. Ringkasan

Website portofolio personal satu halaman (plus halaman case study) untuk menunjukkan karya AI & otomasi.
Kesan yang dituju: **premium, tenang, presisi, sinematik**. Satu momen "wow" di hero dan transisi kartu proyek menjadi halaman case study. Sisanya hemat dan terkendali.

- **Audiens utama:** recruiter dan klien freelance.
- **Positioning:** Hybrid Business + Automation. Headline: *Business Systems & Automation Lead* (positioning, bukan jabatan resmi). Pembeda: paham bisnis (penjualan, P&L, operasional) sekaligus membangun otomasi dan AI.
- **Tujuan konversi:** pengunjung menghubungi Patrik (email / LinkedIn), atau membuka minimal satu case study.
- **Sifat proyek:** nice to have, sehingga **scope harus dibatasi**. Jangan menambah fitur di luar dokumen ini.
- **Biaya:** tidak boleh ada biaya bulanan. Hanya domain (tahunan).

## 2. Keputusan yang sudah final

| Area | Keputusan |
|---|---|
| Mood | Premium & tenang, bertema luar angkasa (revisi Patrik, M7) |
| Referensi | Minimal & rapi ala Apple / Linear |
| Kepadatan | Sedang, seimbang |
| Tipografi | Space Grotesk (judul + isi), JetBrains Mono (angka metrik, label, kode) |
| Palet | Charcoal Gold di atas latar ruang angkasa; tema gelap saja, tidak ada mode terang. Suasana latar bergeser per section (void, nebula, aurora, ember, supernova), semuanya tetap gelap |
| Layout | Spacious Editorial (satu fokus per section) |
| Motion | Cinematic Reveal (hero) + Morph Transition (kartu → case study) |
| Bahasa | Dwibahasa ID / EN dengan toggle |
| Animasi lib | GSAP (gratis, termasuk plugin ScrollTrigger, SplitText, Flip) |
| Morph | **Masuk MVP**, tiap case study adalah halaman terpisah |
| Case study | 4 flagship, **semuanya dianonimkan**: (1) digitalisasi pembelian dan approval, (2) asisten pesan AI multi-kanal + tiket, (3) intelijen brand, (4) agen AI produksi video |
| Proyek lain | MVP: section "Proyek lainnya", maks 6 kartu ringkas (tanpa halaman terpisah dan tanpa Morph) |
| Positioning | Hybrid Business + Automation, headline "Business Systems & Automation Lead" |
| Judul hero | "Bisnis yang saya pahami, otomasi yang saya bangun." / "Business I understand. Automation I build." |
| CV di website | Versi baru AI & Automation, **tanpa nomor telepon** (PDF dari Patrik), tombol "Unduh CV" |

## 3. Item terbuka (jangan ditebak, tanyakan ke Patrik)

- [x] Hosting: **Netlify** (sudah diputuskan Patrik). Situs Netlify `portofoliopa` sudah terhubung ke repo ini. Jaga konfigurasi tetap portabel.
- [ ] Nama domain.
- [ ] Isi final 4 case study (angka dan hasil), lihat `CONTENT.md` bagian `[ISI]`.
- [ ] Koreksi diagram alur 4 case study (draf dari deskripsi singkat dan dokumen Patrik).
- [ ] Case study agen video: Patrik memastikan kepatuhan pada ketentuan layanan platform pihak ketiga; jangan sebut nama platform.
- [ ] Detail 6 kartu "Proyek lainnya" ada di `CONTENT.md` bagian 4b. v2: halaman case study untuk proyek-proyek tersebut.
- [ ] Kontak: email, LinkedIn, GitHub, dan apakah WhatsApp dicantumkan.
- [ ] Foto profil atau murni tipografi.
- [ ] Berkas CV PDF baru dari Patrik (tanpa telepon). Tombol "Unduh CV" memakai file ini. Sampai tersedia, tombol disembunyikan.

## 4. Aturan anonimisasi (WAJIB)

Semua proyek dikerjakan di perusahaan, dan perusahaan tidak boleh disebut.
- Jangan tulis nama perusahaan, klien, kreator, atau nama internal di UI, kode, komentar, nama file, metadata, maupun commit.
- Tidak ada screenshot asli. Semua visual alur dibuat ulang sebagai diagram bersih (SVG/HTML) dari komponen situs.
- Angka boleh relatif (mis. "-70% waktu riset") atau perkiraan berlabel jujur.
- Jangan membuat/menampilkan data yang tampak seperti data nyata.
- Proyek perusahaan sebelumnya diperlakukan sama: tanpa data/screenshot asli dan tanpa nama internal.

## 5. Stack (rekomendasi default; boleh mengusulkan alternatif beserta alasannya)

| Bagian | Pilihan |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS dengan CSS variables untuk tokens |
| Animasi | GSAP + `@gsap/react` (`useGSAP`), SplitText, Flip |
| i18n | Route berbasis locale: `/id`, `/en` (toggle menyimpan pilihan) |
| Font | Self-host (Space Grotesk, JetBrains Mono) via `next/font` atau berkas lokal, `font-display: swap`, hanya weight yang dipakai |
| Konten | Berkas data lokal (MDX atau JSON) per case study dan per locale, tanpa CMS dan tanpa database |
| Deploy | Repo GitHub, auto-deploy dari `main` |

Morph Transition: pilih View Transitions API atau GSAP Flip, pilih yang paling andal di Chrome, Safari, dan Firefox terbaru, dengan fallback crossfade. Tuliskan alasan pilihan di README. **Keputusan (M3): View Transitions API lewat `<ViewTransition>` React**, alasan lengkap di `README.md`.

## 6. Struktur halaman

```
/[locale]                 → halaman utama (single page scroll)
/[locale]/work/[slug]     → halaman case study (4 buah)
```

Section di halaman utama, berurutan:
1. Nav (wordmark kiri, `Work · About · Contact` + toggle ID/EN kanan)
2. Hero
3. Posisi (lead + 3 metrik)
4. Selected Work (4 kartu besar, ditumpuk vertikal)
5. Proyek lainnya (kartu ringkas, maks 6)
6. Tentang
7. Kontak + footer

### Wireframe halaman utama

```
┌──────────────────────────────────┐
│ PATRIK        Work About Contact ID/EN│
├──────────────────────────────────┤
│ 01 / BISNIS & OTOMASI  (label)   │
│                                  │
│ Bisnis yang saya pahami,         │  ← Display; kata "otomasi" emas
│ otomasi yang saya bangun.        │
│                                  │
│ [ Lihat karya ↓ ]   (CTA emas)   │
├──────────────────────────────────┤
│ 02 / POSISI                      │
│ 1 paragraf lead (maks 65ch)      │
│  10 th     3+       <2%          │  ← 3 metrik JetBrains Mono, emas
├──────────────────────────────────┤
│ 03 / SELECTED WORK               │
│ ┌──────────────────────────────┐ │
│ │ 01  Judul (H2)               │ │  ← kartu besar, 1 per "panggung"
│ │ masalah → hasil, 1 angka  →  │ │
│ └──────────────────────────────┘ │
│ (ulangi 4 kali)                  │
├──────────────────────────────────┤
│ 04 / PROYEK LAINNYA              │
│ daftar kartu ringkas (maks 6):   │
│ nama · 1 kalimat · tag · status  │
├──────────────────────────────────┤
│ 05 / TENTANG                     │
│ visual kecil + 2 paragraf        │
│ stack (label mono) + unduh CV    │
├──────────────────────────────────┤
│ 06 / KONTAK                      │
│ "Mari bicara." (H1)              │
│ [ Hubungi saya ] (CTA emas)      │
│ email · LinkedIn · GitHub        │
└──────────────────────────────────┘
```

### Wireframe halaman case study

```
┌──────────────────────────────────┐
│ ← Kembali               02 / 04  │
│ JUDUL PROYEK (H1)                │
│ label: peran · tahun · stack     │
├──────────────────────────────────┤
│ MASALAH   (H3 + 1 paragraf)      │
│ SOLUSI    (H3 + diagram alur)    │
│ HASIL     (3 metrik besar, emas) │
│ PEMBELAJARAN (singkat)           │
├──────────────────────────────────┤
│ Proyek berikutnya →              │
└──────────────────────────────────┘
```

### Grid dan jarak
- Desktop: 12 kolom, lebar konten maks 1200px, margin 64px, gutter 24px.
- Mobile: 4 kolom, margin 24px.
- Jarak vertikal antar section: **160px desktop / 96px mobile**. Semua jarak kelipatan 8px.
- Satu elemen jadi fokus per layar. Garis tipis hanya untuk struktur.

## 7. Design tokens

```css
:root {
  /* Warna (tema gelap saja) */
  --bg-deep:   #0C0A09;
  --bg:        #1C1917;
  --surface:   #292524;
  --border:    #44403C;   /* dekoratif, kontras 1.7:1, jangan untuk teks */
  --text:      #FAFAF9;   /* 16.7:1 */
  --text-2:    #D6D3D1;   /* 11.7:1 */
  --text-muted:#A8A29E;   /* 6.9:1 */
  --accent:    #EAB308;   /* 9.1:1 */
  --accent-dim:#CA8A04;   /* 6.0:1 */
  --accent-glow: rgba(234,179,8,0.12);

  /* Semantic (terpisah dari accent) */
  --success:#4ADE80; --error:#F87171; --warning:#FB923C; --info:#60A5FA;

  /* Easing */
  --ease-out:    cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
}
```

Aturan emas: **maksimal 1 CTA emas per layar**. Emas hanya untuk kata kunci judul, angka metrik, garis halus, dan satu CTA. Jangan dipakai untuk paragraf. `#78716C` (3.65:1) tidak boleh dipakai untuk teks kecil.

## 8. Tipografi

Dua family saja. Format: desktop / mobile.

| Level | Font | Ukuran | Weight | Line-height | Tracking | Dipakai untuk |
|---|---|---|---|---|---|---|
| Display | Space Grotesk | 96 / 48px | 300 | 1.0 | -0.03em | Hero |
| H1 | Space Grotesk | 64 / 40px | 300 | 1.05 | -0.025em | Judul case study, "Mari bicara." |
| H2 | Space Grotesk | 48 / 32px | 300 | 1.1 | -0.02em | Judul section/kartu |
| H3 | Space Grotesk | 32 / 24px | 400 | 1.2 | -0.01em | Sub-judul |
| H4 | Space Grotesk | 24 / 20px | 500 | 1.3 | 0 | Judul kecil |
| Lead | Space Grotesk | 20 / 18px | 400 | 1.6 | 0 | Paragraf pembuka |
| Body | Space Grotesk | 16 / 16px | 400 | 1.6 | 0 | Isi |
| Caption | Space Grotesk | 14 / 14px | 400 | 1.5 | 0 | Keterangan (muted) |
| Metric | JetBrains Mono | 64 / 40px | 500 | 1.0 | -0.02em | Angka hasil (emas) |
| Label | JetBrains Mono | 12 / 12px | 500 | 1.4 | +0.16em, kapital | Eyebrow, tag, nomor section |

- Ukuran fluid dengan `clamp()` (tanpa loncat di breakpoint).
- Lebar baris isi maks `65ch`. Isi minimal 16px, label minimal 12px.
- Jangan pakai weight 600+ di Space Grotesk. Weight yang dimuat: 300, 400, 500 (judul besar ringan, teks kecil 400-500).
- Gunakan `font-variant-numeric: tabular-nums` untuk angka.

## 9. Motion spec

Hanya animasikan `transform` dan `opacity`. **Dilarang `transition: all`**. Jangan pernah animasi dari `scale(0)` (mulai dari `scale(0.95)` + opacity).

| Elemen | Gerakan | Durasi | Easing | Catatan |
|---|---|---|---|---|
| Hero: latar + glow | Fade-in cahaya emas halus (12%) | 600ms | ease-out | Mulai 0ms |
| Hero: label | Fade + naik 12px | 400ms | ease-out | Mulai 200ms |
| Hero: judul Display | Satu blok: naik 24px + fade (CSS murni, tanpa menunggu JS agar LCP cepat) | 700ms | ease-out | Mulai 400ms |
| Hero: kata kunci | Warna → emas | 500ms | ease | Mulai ~1000ms |
| Hero: CTA + nav | Fade-in | 400ms | ease-out | Mulai 1200ms, total ±1,6 detik |
| Hover kartu proyek | Border → `--accent-dim`, panah geser 4px | 200ms | ease | **Hanya** `@media (hover: hover) and (pointer: fine)` |
| Tekan (CTA, kartu) | `scale(0.97)` pada `:active` | 160ms | ease-out | |
| Morph: kartu → case study | Judul, nomor, visual bergerak (shared element) | 400ms masuk / 280ms keluar | ease-in-out | Keluar lebih cepat dari masuk, bisa diinterupsi |
| Morph: isi lain | Fade-in setelah morph berjalan | 200ms, mulai 200ms | ease-out | Tidak menunggu morph selesai |
| Section lain | Fade + naik 12px saat masuk layar, sekali saja | 280ms | ease-out | Hanya `opacity` dan `transform`; tanpa JS atau saat reduced-motion, konten langsung tampil |

Aturan:
- Semua keadaan awal tersembunyi (hero dan reveal section) punya pengaman CSS: jika skrip tidak berjalan, konten tampil sendiri setelah 3 detik.
- Hero hanya diputar **sekali per sesi**. Teks ada di DOM sejak awal (tidak diblokir animasi), agar cepat terbaca dan ramah SEO.
- `prefers-reduced-motion`: hero langsung ke kondisi akhir, morph diganti crossfade 150ms, hilangkan semua transform.
- Animasi UI biasa di bawah 300ms, kecuali hero dan morph.
- Elemen masuk memakai ease-out, keluar lebih cepat dari masuk.

### Ruang angkasa (revisi Patrik, M7-M9)

Patrik meminta gerak yang lebih hidup dan bertema luar angkasa (nebula, ledakan, lubang hitam), efek teks "debu bintang", dan warna kontras antar section. Keputusan:
- **Latar kosmos** (`src/components/cosmos/`): kanvas WebGL (shader nebula + bintang) di desktop; di HP, CSS murni (gradien yang bergeser pelan lewat `transform`/`opacity`).
- **Tingkat kualitas**: `full` (desktop berkemampuan), `lite` (HP, tablet, perangkat lemah), `off` (reduced-motion atau data saver). Pemantau FPS menurunkan tingkat otomatis dan hasilnya diingat selama sesi. Kanvas berhenti saat tab tersembunyi.
- **Kontras warna**: tiap section memakai `data-cosmos` untuk suasana warna; semua palet gelap dan lolos kontras teks 4.5:1.
- **Aturan animasi diperbarui**: elemen DOM tetap hanya `transform` dan `opacity`; kanvas/WebGL diizinkan lewat tingkat kualitas di atas dan harus menghormati `prefers-reduced-motion`.
- **Kursor cahaya (M9, disetujui Patrik)**: titik cahaya emas lembut yang mengikuti pointer dan membesar di atas tautan dan kartu, hanya untuk mouse (`hover: hover` dan `pointer: fine`), kursor asli tetap tampil, mati di layar sentuh dan reduced-motion.
- **Tetap dilarang**: scroll hijacking dan section tertahan (pinned), kursor yang menggantikan kursor asli, suara otomatis, mode terang.
- **Teks debu bintang (M8, selesai)**: judul hero meniup jadi debu mengikuti scroll, judul "Proyek lainnya" dan "Mari bicara." dirakit dari debu saat masuk layar, semua judul dan paragraf (kecuali judul case study, label, nav, teks kartu) dirakit dari debu saat masuk layar; GSAP diganti Motion.
- **Lubang hitam (M9, selesai)**: selalu ada di latar, bergeser mengikuti scroll dan condong ke tepi layar. Tingkat full: lensa gravitasi (bintang dan nebula melengkung) + cincin emas miring dengan sisi lebih terang + inti hitam, di shader. Tingkat lite: elemen CSS (cincin berputar pelan, posisi lewat `transform`). Off: tidak ada.
- **Intro sinematik (M10, disetujui Patrik, terinspirasi intro situs referensi)**: di beranda, sebelum Hero, ada layar sticky 260vh (190vh di HP) yang terikat scroll: bintang membesar (zoom), gerbang cincin emas membesar melewati layar (kamera masuk), lapisan debu bergeser ke atas (dolly), lalu Hero muncul. Hanya `transform` dan `opacity`; scroll tetap native. Aktif sekali per sesi (`intro-seen`; kembali ke beranda lewat navigasi dalam sesi yang sama menampilkan layout yang sama agar posisi scroll yang dipulihkan tetap benar), tidak aktif bila reduced-motion, data saver, ada `#hash`, atau bukan beranda; ada tombol Lewati intro. Teks petunjuk dan tombol baru perlu dikonfirmasi Patrik (lihat `TODO.md`).
- **Transisi lubang hitam dan halaman terang (M12, disetujui Patrik)**: masuk ke studi kasus (klik kartu atau "Proyek berikutnya") menyedot halaman lama ke lubang hitam, lalu halaman studi kasus tampil berlatar terang; kembali ke beranda tetap gelap dengan morph kartu. Intro beranda tanpa navbar (muncul setelah intro) dan berisi sapaan "WELCOME TO MY PORTFOLIO" yang dirakit dari debu.
- **Berikutnya (M9)**: ledakan nebula saat ganti section, kartu 3D saat hover, audit.

## 10. Komponen

`Nav`, `LangToggle`, `Hero`, `Eyebrow` (label mono + nomor), `Metric` (angka mono emas + keterangan), `ProjectCard` (besar, bisa morph), `OtherProjectCard` (ringkas, tanpa morph; hover hanya border), `CaseStudyLayout`, `FlowDiagram` (diagram alur SVG/HTML dari data), `StackTags`, `ContactBlock`, `Footer`, `Button` (varian: primary emas, ghost).

`FlowDiagram` penting (varian mini tanpa label sudah dipakai di kartu Selected Work; varian lengkap berlabel dibuat di M3): pekerjaan Patrik sebagian besar "tak terlihat", jadi diagram alur adalah visual utama tiap case study. Data langkah (3-5 node) datang dari `CONTENT.md`.

## 11. Model konten

Tiap case study (per locale):

```ts
type CaseStudy = {
  slug: string;
  order: number;            // 1-4
  title: string;
  tagline: string;          // 1 kalimat masalah → hasil
  role: string;
  year: string;
  stack: string[];
  context: string;
  problem: string;
  solution: string;
  flow: { label: string; note?: string }[];   // 3-5 node
  metrics: { value: string; label: string; estimate?: boolean }[]; // 3
  learning?: string;
};
```

Metrik dengan `estimate: true` ditandai jujur di UI (mis. "perkiraan").

Kartu "Proyek lainnya" (per locale):

```ts
type OtherProject = {
  id: string;
  name: string;
  summary: string;   // 1 kalimat
  tags: string[];    // 3 tag
  status: string;
  link?: string;     // hanya untuk proyek mandiri yang aman dipublikasikan
};
```

## 12. Aksesibilitas & performa

- Kontras teks minimal 4.5:1 (token di atas sudah dicek).
- Semua interaksi bisa dijangkau keyboard. Fokus terlihat jelas (outline emas).
- `lang` diatur sesuai locale. Toggle bahasa punya label aksesibel.
- Target: LCP < 2.5 detik di mobile, tanpa layout shift saat font muat, bundle JS sehemat mungkin.
- Gambar/diagram dioptimasi. Tidak ada video autoplay berat.
- Metadata (title, description, OG) per locale. Sitemap dan `hreflang` untuk ID/EN.

## 13. Yang TIDAK boleh dibuat (guardrails)

Scroll hijacking dan section pinned (satu pengecualian disetujui Patrik: intro sinematik beranda M10, section sticky yang scroll-nya tetap native, tanpa `preventDefault`, dengan tombol Lewati dan mati di reduced-motion), kursor kustom selain cahaya pointer yang diizinkan (bagian 9: hanya mouse, kursor asli tetap tampil), auto-play suara, mode terang (satu pengecualian disetujui Patrik, M12: halaman studi kasus berlatar terang dan beranda tetap gelap), animasi di setiap elemen DOM tanpa tingkat kualitas (partikel dan canvas/WebGL kini diizinkan hanya lewat tingkat kualitas, lihat bagian 9), CMS, backend/database, kolom komentar, blog (v2), halaman case study untuk "Proyek lainnya" (v2), arsip semua proyek (v2), bagian repo showcase (v2).

## 14. Urutan build

| Milestone | Isi |
|---|---|
| M0 | Setup repo, tokens, font self-host, skeleton i18n `/id` `/en` |
| M1 | Seluruh section statis dengan konten placeholder dari `CONTENT.md` |
| M2 | Hero Cinematic Reveal + reduced-motion |
| M3 | Template case study + Morph Transition + fallback |
| M4 | Integrasi konten final ID/EN |
| M5 | Pass aksesibilitas dan performa (LCP, kontras, keyboard) |
| M6 | Deploy, domain, metadata, README |

## 15. Acceptance criteria (MVP selesai jika)

- [ ] Live di URL sendiri, dapat dibuka di desktop dan mobile.
- [ ] Hero memainkan sequence sekali per sesi, teks terbaca ≤ 1,6 detik, dan reduced-motion dihormati.
- [ ] Kartu → case study melakukan morph dan punya fallback crossfade.
- [ ] 4 case study lengkap dalam ID dan EN, toggle bahasa berfungsi dan tersimpan.
- [ ] Section "Proyek lainnya" tampil dengan maksimal 6 kartu ringkas.
- [ ] Tidak ada nama perusahaan/klien/kreator di mana pun (cek dengan pencarian teks).
- [ ] Kontras, fokus keyboard, dan performa lolos.
- [ ] Tidak ada fitur di luar bagian "Yang TIDAK boleh dibuat".
