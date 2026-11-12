# TODO

Daftar ini dipelihara bersama. Claude Code mencatat di sini tiap teks sementara yang dipakai karena data belum tersedia.

## Dari Patrik (data dan keputusan)
- [x] Status Purchasing 2.0 (uji coba) dan angka ±2 hari → ±30 menit (terukur): dikonfirmasi
- [ ] Purchasing: angka metrik 3 (jumlah permintaan diproses selama uji coba), dasar pengukuran angka ±2 hari → ±30 menit (1 kalimat), dan teks Pembelajaran (draf: "merancang fondasi data yang siap naik ke sistem ERP", belum disetujui)
- [ ] Data 3 case study lain (asisten pesan + tiket, intelijen brand, agen video): konteks, masalah, solusi, 3 metrik, pembelajaran
- [ ] Koreksi diagram alur 4 case study (`CONTENT.md` bagian 5)
- [ ] Detail 5 kartu "Proyek lainnya": status, stack, pilihan L5/L6, nama model AI offline
- [ ] Konfirmasi metrik Posisi: 10 tahun, 3+ sistem, <2% RTS
- [x] Email dan GitHub terisi (M21). [x] Nomor WhatsApp dan LinkedIn terisi (M21)
- [ ] Berkas CV PDF baru (tanpa nomor telepon)
- [x] Hosting: Netlify (situs `portofoliopa` sudah terhubung). Masih perlu: nama domain, dan matikan akses SSO tim di Netlify agar situs bisa dibuka publik sebelum tayang
- [ ] Cek ketentuan layanan platform pihak ketiga sebelum case study agen video tayang

## Dicatat oleh Claude Code (teks sementara yang dipakai)
Tempat teks: `content/{id,en}/home.json` dan `content/site.json`.

**Placeholder netral (menunggu data Patrik)**
- Angka kartu Selected Work 02, 03, 04 tampil "—"
- Tagline kartu 02, 03, 04 dipangkas tanpa klaim hasil (bagian `[ISI: hasil]` dibuang)
- Status 4 kartu Proyek lainnya (L1, L2, L5, L6) tampil "Segera diperbarui" / "Being updated"
- Tag stack `[ISI]` pada kartu L1 dibuang (tersisa 2 tag)
- Email, LinkedIn, GitHub, WhatsApp kosong: tautan tidak tampil, tombol "Hubungi saya" disembunyikan dan diganti teks "Informasi kontak segera tersedia"
- Blok baru case study (M20, draf `[KONFIRMASI]`): "Struktur sistem" (angka dari dokumentasi database Patrik per 10 Nov 2026: kartu 02 = 38 tabel/39 fungsi/48 kebijakan akses; kartu 03 = 14/27/3 peran; kartu 04 = 40/160/79) dan "Workflow yang dibangun" di kartu 04 (2 workflow n8n ditulis ulang generik). Perlu dikonfirmasi Patrik sebelum tayang
- Pesan pembuka WhatsApp: ID disetujui Patrik; terjemahan EN "Hello, I would like to talk further with you." perlu dikonfirmasi; email dan nomor tampil di HTML publik dan bisa dikumpulkan bot spam
- Blok baru M22 (draf `[KONFIRMASI]`): 6 workflow kartu 02, angka 15 workflow aktif/±2.000 node/3 kanal (hitungan dari file ekspor per 11 Nov 2026), dan blok "Cara saya membangun" di Tentang. Patrik cek bahwa ringkasan alur sesuai kenyataan
- Keamanan: file JSON workflow memuat token bot, JWT, nomor telepon, dan ID chat yang tertanam; ganti (rotate) token yang pernah berada di repo saat masih publik. Jangan pernah mempublikasikan JSON mentah
- Pembaruan kartu M24 (draf `[KONFIRMASI]`): konteks, masalah, solusi, alur, dan angka cakupan kartu 02–04; kartu baru L7 di Proyek lainnya. Patrik cek bahwa deskripsi ("tim layanan pelanggan", "tim konten", "layanan pemantauan brand") sesuai kenyataan, dan kirim angka hasil nyata bila ada
- Tombol "Unduh CV" disembunyikan sampai `cvFile` di `content/site.json` terisi (PDF baru tanpa nomor telepon)

**Draf `[KONFIRMASI]` yang tampil apa adanya (perlu disetujui)**
- Lead Posisi dan 3 metrik Posisi (10 tahun, 3+, <2%)
- Angka kartu 01 "±2 hari → ±30 menit", dilabeli "perkiraan"
- Dua paragraf Tentang dan daftar tag stack (n8n, Google Gemini API, Telegram Bot API, Google Apps Script, Google Sheets, Apify)
- Status kartu L4 "Eksperimen (2025)" dan nama model AI offline (tidak disebut)

**Halaman case study (M3), data: `content/{id,en}/case-studies.json`**
- Bagian Konteks (kecuali Purchasing), Masalah, Solusi, dan Pembelajaran untuk case study 02, 03, 04 menampilkan "Isi case study ini sedang disiapkan." (Masalah, Solusi, Pembelajaran) atau disembunyikan (Konteks)
- Pembelajaran Purchasing tampil teks netral yang sama (menunggu teks dari Patrik)
- Metrik 2 dan 3 case study 02 sampai 04 tampil "—"; metrik 3 Purchasing tampil "—" (menunggu angka)
- Peran dan stack case study 03 dan 04 tidak tampil (tersisa tahun saja)
- Draf `[KONFIRMASI]` yang tampil apa adanya: stack case study 02 dan alur 5 langkah case study 02, 03, 04 (diagram alur penuh). Peran, konteks, dan alur Purchasing sudah dikonfirmasi Patrik
- Pengujian Safari dan Firefox untuk Morph Transition belum dilakukan (hanya Chromium)

**Keputusan `[PILIH]` yang saya ambil sementara**
- Baris paroki di Tentang: dihilangkan
- Visual Tentang: foto profil (M18); teks alt `about.photoAlt` perlu dikonfirmasi. Tanda bintang kecil (watermark alat) di pojok kanan bawah foto sumber sudah dihapus dengan menutup area itu dengan warna latar sekitarnya; ukuran foto tidak berubah
- Kartu L5 dan L6: keduanya tampil (total 5 kartu)
- Halaman 404 dwibahasa: ditunda ke M6

## Sebelum publik
- [x] Pencarian teks: tidak ada nama perusahaan, klien, kreator (kode, konten, hasil build, pesan commit; diperiksa di M6, ulangi setelah konten final M4)
- [x] Tidak ada `[ISI` dan `[KONFIRMASI` yang tersisa di tampilan (diperiksa di M6; teks sementara netral tampil sebagai gantinya, ulangi setelah M4)
- [x] Pemindaian secret bersih (`secretlint` pada semua berkas yang dilacak, ditambah pencarian pola kunci; `gitleaks` tidak tersedia di lingkungan pengembangan)
- [x] Lighthouse, kontras, keyboard, reduced-motion lolos (M5; ulangi setelah M4 dan setelah domain aktif)
- [ ] Atur `SITE_URL` di Vercel setelah domain diputuskan, lalu deploy ulang
- [ ] Pastikan Deployment Protection (Vercel) tidak menutup produksi sebelum publik
- [ ] Uji Morph Transition di Safari dan Firefox
- [ ] Uji efek debu bintang dan animasi kata di HP nyata dan di Safari/Firefox
- [ ] Nilai kursor cahaya di desktop nyata (kehalusan, ukuran, warna) dan beri tahu bila perlu disesuaikan
- [ ] Uji latar ruang angkasa di HP nyata (bagus atau patah-patah?) lewat branch deploy, dan di Safari/Firefox desktop
- [ ] Konfirmasi nama lengkap "Patrik Andryan" di header sudah sesuai

- [x] Konfirmasi teks intro baru (M10) (disetujui Patrik): `intro.hint` ("Gulir untuk masuk" / "Scroll to enter") dan `intro.skip` ("Lewati intro" / "Skip intro") di `content/{id,en}/common.json`. Teks sementara yang netral.
- [ ] Konfirmasi metrik 1 (M11): angka "10" dengan satuan di samping angka ("10 years" / "10 tahun") dan keterangan "across 4 industries" / "lintas 4 industri".
- [x] Konfirmasi teks sapaan intro (M12) (disetujui Patrik): `intro.welcome` EN "WELCOME TO MY PORTFOLIO", ID "SELAMAT DATANG DI PORTOFOLIO SAYA" (terjemahan sementara).
- [ ] Tinjau tampilan terang halaman studi kasus (M12) di perangkat sungguhan, termasuk kontras teks emas gelap.
- [ ] Konfirmasi teks panel Tampilan (M16): `display.*` di `content/{id,en}/common.json` (Matikan/Hidupkan animasi, Warna halaman, Bawaan, Gelap, Abu-abu muda, Krem). Teks sementara yang netral.
- [x] Musik latar (M17): berkas dipasang di `public/audio/ambient.mp3` (utuh 4:41, 128 kbps, metadata dihapus, fade 1,5 detik di awal dan 3 detik di akhir agar ulangan halus). Lisensi lagu adalah tanggung jawab Patrik (keputusan Patrik). Semula: Patrik menyediakan berkas MP3 sekitar 3 menit (lisensi jelas, nama berkas tanpa nama kreator), taruh di `public/audio/` dan isi `content/site.json` `music` (mis. `"/audio/musik.mp3"`). Disarankan 128 kbps (sekitar 3 MB) dan sambungan awal-akhir yang mulus karena diulang.
- [ ] Konfirmasi teks tombol musik (M17): `display.music` ("Musik"), `display.musicOn` / `display.musicOff` ("Hidupkan musik" / "Matikan musik").
