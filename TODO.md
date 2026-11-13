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
- Pembaruan M25 (draf `[KONFIRMASI]`): angka hasil kartu 02 dan teks kartu 02 dan 04. Keputusan Patrik: waktu penyelesaian tiket tidak ditampilkan, dan pembelajaran kartu 02 (insiden balasan berulang) tidak ditampilkan. Masih perlu dipastikan klaim (kata-kata audiens sudah diganti menjadi netral: "pelanggan" dan "tim")dan pembelajaran (termasuk insiden sekitar 640 balasan) boleh tampil. Kartu 04: jalankan query di `PORTFO-CASE-04.md` bagian 5.4 untuk angka hasil produksi, dan kirim waktu kerja manual per video bila ingin klaim penghematan
- KEAMANAN (dari bagian 5.9 kedua hasil analisis; tidak ada di repo portofolio): rahasia bersama 64 karakter tertanam di berkas klien prototipe lama dan ada di riwayat git sejak 10 Sep 2026; token akses di header node HTTP beberapa workflow n8n; token peran publik dan ID project di banyak berkas; berkas tautan project terlacak di git; repo aplikasi web pemantau tidak punya `.gitignore`. Tindakan: ganti (rotate) rahasia, bersihkan riwayat git, tambahkan `.gitignore`
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

- [ ] Penampil alur (M29): cek terjemahan Inggris (±220 nama langkah, 21 tahap, 17 skenario) dan nama langkah sederhana di `content/{id,en}/flows.json`; nama layanan sudah diganti istilah umum. Alur staf memuat fitur "resolve semua" yang di data produksi belum pernah dipakai (0 permintaan); dipertahankan karena itu struktur workflow asli. Alur IG/Facebook (104 langkah), video, dan lainnya belum termasuk. Uji pinch-zoom di perangkat sentuh sungguhan.
- [ ] Temuan lama: `.music-bar` memicu aturan axe `region` (di luar landmark); belum diperbaiki.

- [ ] Penampil alur per kartu (M30): kartu 01 memakai alur ilustratif buatan saya (cek wajar atau tidak; label "Ilustrasi proses"); kartu 03 memakai alur arsip dengan label jujur (nama langkah ±200, ID dan EN, terjemahan/tafsiran saya); alur kartu 04 (30 langkah, 7 skenario) saya susun dari dokumentasi dan kode repo sistem video (bukan ekspor), Patrik cek kebenarannya, terutama urutan Penyelesaian. Judul jalur skenario kartu 03/04 dibuat otomatis (mis. "Jalur 2: Kirim hasil"). Di HP penampil diganti ringkasan teks (keputusan Patrik).
- [x] Hasil kartu 04 (M33): angka produksi dari query Supabase yang Patrik jalankan 12 Nov 2026 22:05 UTC: 58 job (43 video terunduh, 7 gagal, 8 belum berakhir), keberhasilan 43 dari 50 = 86%, median mulai-ke-terunduh 2,5 menit (p90 329 menit, ada outlier), 6 dari 47 job yang dijalankan butuh percobaan ulang; struktur 41 tabel, 162 fungsi, 82 kebijakan, 42 pemicu. Sampel kecil; biaya per video tidak tersedia (hanya 2 job jalur API punya biaya). Ulangi query bila ingin angka terbaru.
- [ ] Biaya kartu 04 (M34): "Rp 5,7 rb" per video 20 detik 360p dengan narasi adalah PERKIRAAN saya dari query Supabase 12 Nov 2026: klip 14 kredit x Rp 236,6 per kredit (paket "Pro + Top Up" Rp 827.990 untuk 3.500 kredit, parameter 18 Okt) + storyboard 2 x $0,0438 + ganti suara $0,0386 + naskah dan analisis $0,0053, kurs Rp 18.175. Tidak termasuk kredit naik 720p (tidak tercatat), biaya tetap (kosong), dan tenaga staf; 6 klip tanpa kredit terbaca; hampir semua video 360p (kualitas draf). Patrik cek harga paket yang dipakai. Tanpa nama atau harga kompetitor di situs.
- [ ] Kartu 04, Solusi dan Pembelajaran (M35): teks "pengaman bawaan" mengikuti halaman awal situs sistem video. Cek dua klaim: (1) pemeriksa kata klaim hanya di antarmuka (dari catatan repo, belum ditelusuri apakah fungsi server juga memeriksanya); (2) celah "staf bisa menyisipkan job ke antrean dan memalsukan persetujuan" berasal dari komentar migrasi 5 Okt 2026 (terbukti di pengujian lokal, bukan insiden produksi).

- [ ] Urutan kartu berubah (M36): 01 agen video, 02 asisten pesan, 03 intelijen merek, 04 digitalisasi pembelian. Catatan TODO dan CONTENT lama menyebut nomor lama (01 = pembelian, 04 = agen video); pakai slug. Narasi "dari otomasi proses bisnis ke AI" di CONTENT.md terbalik sekarang; cek apakah teks Tentang atau Hero memakai urutan itu.
- [ ] Halaman detail Proyek lainnya (M37): (1) Excel "11 July 23" belum diunggah sebagai .xlsx (konektor hanya mengembalikan nama tab: PACKING 1.863 baris, LSM/LSB/LSMP 1.701 baris x 106 kolom, Entitas 2.027 baris, tab per packer). Setelah diunggah: angka Hasil proyek 1 (agregat saja, tanpa nama orang atau pelanggan), dan konfirmasi bahwa itu proses manual sebelum aplikasi; (2) konfirmasi peran, tahun (2023), status "Dipakai", dan stack proyek 1; teks masalahnya adalah kesimpulan saya dari struktur spreadsheet; (3) proyek 3: konfirmasi peran, tahun 2026, status (README: belum tersambung infrastruktur); (4) proyek 2, 5, 6: butuh bahan (repo scouting kreator belum ditemukan; repo `tiktok-sc` adalah dashboard analitik video, bukan scouting); (5) proyek 4: klaim "berjalan" belum terbukti (screenshot menunjukkan galat koneksi); (6) Pembelajaran semua proyek belum ditulis.
- [ ] Proyek Alat otomasi internal (M40): isi baru dari dokumentasi Creator Pulse v2.0 dan repo `tiktok-sc` (push terakhir 20 Jul 2026). Cek: (1) apakah kartu ini memang proyek yang sama dengan deskripsi lama "scouting kreator berbasis skor prioritas dan bot riset tren" (deskripsi lama saya ganti); (2) judul kartu masih "Alat otomasi internal", bisa diganti mis. "Dashboard analitik performa video creator"; (3) peran, tahun 2026, dan status (belum ditulis); (4) teks Masalah adalah inferensi saya; (5) angka dokumen (13 endpoint, 6 tabel, 4 view) belum dicocokkan ke database; repo hanya punya 11 berkas route dan tanpa `sql/schema.sql`; (6) alur interaktif `metrics` dipindah dari kartu 03 ke proyek ini karena judulnya cocok dengan workflow di dokumentasi (alur komentar kartu 03 belum tentu sama dan tetap di kartu 03).
- [ ] Katalog model AI (M41) butuh tindakan Patrik agar data nyata muncul: (1) di Google Sheets: File > Bagikan > Publikasikan ke web > pilih tab "Full Model" > CSV, salin URL; (2) di Vercel > Settings > Environment Variables: `MODELS_CSV_URL` = URL itu (Production dan Preview); (3) di Vercel > Settings > Git > Deploy Hooks: buat hook untuk branch produksi; (4) di GitHub repo > Settings > Secrets > Actions: `VERCEL_DEPLOY_HOOK_URL` = URL hook; (5) pastikan berkas `.github/workflows/daily-deploy.yml` ada di branch default (jadwal hanya jalan dari sana; push berkas workflow bisa ditolak izin, tempel lewat web GitHub bila perlu); (6) jalankan sekali manual (Actions > Daily deploy > Run workflow) dan periksa log build baris `[fetch-models]`. Tanpa langkah 1-2 halaman menampilkan "Data belum tersedia". Cek juga: sebagian harga di sheet dari tempel manual; nama sumber harga tampil apa adanya atas keputusan Patrik; jadwal GitHub bisa terlambat 5-30 menit (cron 09:45 WIB agar live sekitar 10:00).

