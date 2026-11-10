# TODO

Daftar ini dipelihara bersama. Claude Code mencatat di sini tiap teks sementara yang dipakai karena data belum tersedia.

## Dari Patrik (data dan keputusan)
- [ ] Status Purchasing 2.0 (uji coba / sudah dipakai) dan apakah angka ±2 hari → ±30 menit terukur atau estimasi
- [ ] Data 3 case study lain (asisten pesan + tiket, intelijen brand, agen video): konteks, masalah, solusi, 3 metrik, pembelajaran
- [ ] Koreksi diagram alur 4 case study (`CONTENT.md` bagian 5)
- [ ] Detail 5 kartu "Proyek lainnya": status, stack, pilihan L5/L6, nama model AI offline
- [ ] Konfirmasi metrik Posisi: 10 tahun, 3+ sistem, <2% RTS
- [ ] Email, LinkedIn, GitHub, WhatsApp (ya/tidak), foto atau tanpa foto
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
- Tombol "Unduh CV" disembunyikan sampai `cvFile` di `content/site.json` terisi (PDF baru tanpa nomor telepon)

**Draf `[KONFIRMASI]` yang tampil apa adanya (perlu disetujui)**
- Lead Posisi dan 3 metrik Posisi (10 tahun, 3+, <2%)
- Angka kartu 01 "±2 hari → ±30 menit", dilabeli "perkiraan"
- Dua paragraf Tentang dan daftar tag stack (n8n, Google Gemini API, Telegram Bot API, Google Apps Script, Google Sheets, Apify)
- Status kartu L4 "Eksperimen (2025)" dan nama model AI offline (tidak disebut)

**Keputusan `[PILIH]` yang saya ambil sementara**
- Baris paroki di Tentang: dihilangkan
- Visual Tentang: murni tipografi (tanpa foto)
- Kartu L5 dan L6: keduanya tampil (total 5 kartu)
- Halaman 404 dwibahasa: ditunda ke M6

## Sebelum publik
- [ ] Pencarian teks: tidak ada nama perusahaan, klien, kreator
- [ ] Tidak ada `[ISI` dan `[KONFIRMASI` yang tersisa di tampilan
- [ ] `gitleaks detect` bersih
- [ ] Lighthouse, kontras, keyboard, reduced-motion lolos
