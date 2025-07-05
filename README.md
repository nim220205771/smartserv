# 🚗 SmartServ - Sistem Informasi Maintenance Kendaraan Operasional

Sistem ini merupakan prototipe sistem informasi berbasis web menggunakan **Google Apps Script (GAS)** dan **Google Spreadsheet** sebagai back-end, dirancang untuk mengelola perawatan kendaraan operasional pada sebuah perusahaan. Sistem mencakup pelaporan kerusakan, penyusunan RAB perbaikan, penerbitan SPK, dan pelacakan progres maintenance.

---

## 🧩 Fitur Aplikasi

- 🔧 **Pelaporan & RAB**: Form online lengkap untuk input laporan kerusakan dan buat RAB berdasarkan `harsat`
- 📎 **Dokumentasi**: Unggah & simpan bukti ke Google Drive (kerusakan, perbaikan, SPK, BA)
- 📋 **Status Otomatis**: Sistem cerdas menentukan status berdasarkan kelengkapan
- 👥 **Manajemen User**: Tambah user dengan akses terbatas sesuai menu (public, admin, izusu, dll)
- 📊 **Analitik**: Dashboard & Sheet `analytics_maintenance` untuk insight dan evaluasi

---

## ✅ Fitur Utama
1. ✅ User Authentication
2. ✅ Manajemen Pengguna (CRUD)
3. ✅ Harga Satuan (Barang dan Jasa) – dengan enkripsi data
4. ❌ Data Kendaraan (On Progress)
5. ❌ Dashboard Analitik – grafik tren & frekuensi (On Progress)
6. ✅ Pelaporan Kerusakan Kendaraan
7. ✅ Penyusunan RAB Perbaikan
8. ✅ Penerbitan SPK Pekerjaan
9. ❌ Berita Acara Perbaikan (On Progress)

---

## 👥 Default Akun
username: admin
passkey : admin

---

## 🛠️ Teknologi & Library
- Google Apps Script (GAS)
- Google Spreadsheet (cloud database)
- jQuery, Bootstrap, DataTables
- SweetAlert2, FontAwesome
- Enkripsi AES: [`cCryptoGS v4`](https://script.google.com/macros/library/d/MSJnPeIon6nzdLewGV60xWqi_d-phDA33)

---

## 🔐 Keamanan & Variabel Utama
- Kunci Enkripsi: `ᗩrisՈurᗰahendra`
- `spreadsheetId`: ID Spreadsheet utama
- `folderIMG`: ID folder Drive untuk menyimpan gambar (shared)
- `folderPDF`: ID folder Drive untuk menyimpan file PDF (shared)

---

## 🧩 Struktur Spreadsheet

### Header & Relasi
- Baris ke-1: **Header kolom**
- Baris ke-2: **Relasi antar-sheet** (penting untuk automasi)

### Sheet Overview
| Sheet       | Deskripsi |
|-------------|-----------|
| `users`     | Data pengguna sistem |
| `harsat`    | Harga satuan suku cadang & jasa (dienkripsi) |
| `vehicles`  | Data kendaraan operasional perusahaan |
| `laporan`   | Pelaporan kerusakan kendaraan |
| `no_rab`    | Header data RAB per kendaraan |
| `rab`       | Detail item RAB dari laporan |
| `no_spk`    | Header SPK pekerjaan |
| `no_ba`     | Header berita acara perbaikan |
| `reference` | Relasi file/link antar dokumen (Drive) |
| `resume`    | Data ringkasan dan analisis status dokumen |

### Struktur Kolom per Sheet (🧷 Penting)
#### `users`
- uid, name, passkey, fullname, perusahaan, jabatan, asis, deleted

#### `harsat`
- uid, nama_barang, harga_barang, satuan_barang, jenis_barang (`JASA` / `SUKU CADANG`), deleted

#### `vehicles`
- id, plat_kr, jenis, merk, no_mesin, no_rangka, warna, tahun, deleted

#### `laporan`
- uid, user, tanggal_lapor, odo_meter, plat_kr, deskripsi, image_lapor, rencana_perbaikan, tanggal_perbaikan, image_perbaikan, status_perbaikan, ref_rab, ref_spk, ref_ba, ref_invoice, deleted

#### `no_rab`
- no_rab, tanggal_rab, plat_kr, total_rab, no_spk, no_ba, keterangan, status_rab, ref_rab, ref_spk, ref_ba, deleted

#### `rab`
- uid_rab, uid_laporan, no_rab, tanggal_rab, item_nama, item_qty, item_satuan, item_harga, item_total, keterangan, status_rab, plat_kr, constomer, alamat, no_rangka, odo_meter, warna_tahun, deleted

#### `no_spk`
- no_spk, tanggal_spk, keterangan, status_spk, no_rab, no_ba, ref_rab, ref_spk, ref_ba, deleted

#### `no_ba`
- no_ba, tanggal_ba, keterangan, status_ba, no_rab, no_spk, ref_rab, ref_spk, ref_ba, deleted

#### `reference`
- timestamps, this, no, ref, url

#### `resume`
- Menyediakan hasil `COUNTIF` dan rekap analisis status dokumen

---

## 🚀 Deploy Aplikasi

1. **Salin spreadsheet**  
   Gunakan [template spreadsheet](https://docs.google.com/spreadsheets/d/1W45voTxTFQO3JpOsN0rFJ8bmVUpx8HCW_be6eMYsd_0/edit#gid=0)

2. **Siapkan Google Apps Script**
   - Buat project baru di [Apps Script](https://script.google.com)
   - Upload semua file: `Code.gs`, `HTML`, `JS`, dll
   - Sambungkan Spreadsheet ID & Folder Drive ID

3. **Deploy sebagai Web App**
   - Pilih **Deploy > Web App**
   - Atur siapa saja yang bisa mengakses
   - Salin URL Web App sebagai link akses pengguna

---

## 📊 Evaluasi & Pengujian
- Fitur berjalan tanpa error (✅ validasi input, ✅ dependensi)
- Load time rata-rata: < 3 detik (cached data, async)
- Enkripsi AES mencegah kebocoran data di spreadsheet
- Dashboard analitik: (on progress) — akan memuat:
  - 📈 Grafik Linechart: tren waktu perbaikan
  - 📊 Grafik Barchart: frekuensi kendaraan rusak
  - 🧰 Filter berdasarkan periode dan jenis kendaraan

## 📁 Panduan Template Spreadsheet
📌 Gunakan template berikut untuk memulai:  
🔗 [Template Spreadsheet](https://docs.google.com/spreadsheets/d/1W45voTxTFQO3JpOsN0rFJ8bmVUpx8HCW_be6eMYsd_0/edit#gid=0)  
☑️ Salin spreadsheet ke akun Google Drive Anda melalui `File > Buat Salinan`.

---

## 💡 Tips Teknis

- Gunakan `google.script.run.getHarsat()` untuk mengisi data harga otomatis saat memilih item
- Gunakan `UID + Timestamp` untuk membuat ID unik (`UID123456`)
- Gunakan `SweetAlert2` untuk UX responsif saat upload gambar
- DataTables digunakan untuk menampilkan laporan & RAB secara interaktif

---

## 💬 Catatan Pengembangan
- Sistem dirancang dengan prinsip low-code, namun mendukung pengembangan lanjut (integrasi API atau dashboard analitik lanjutan via Looker Studio, dsb).
- Struktur modular memudahkan manajemen fitur berdasarkan sheet, dan mampu mendukung ekspansi ke fitur ERP lainnya seperti pengadaan, logistik, dll.

---

## 📌 Status Proyek

| Fitur              | Status     |
|--------------------|------------|
| User Auth          | ✅ Selesai |
| User Management    | ✅ Selesai |
| Harga Satuan       | ✅ Selesai |
| Kendaraan          | 🚧 Belum   |
| Dashboard Analitik | 🚧 Belum   |
| Laporan            | ✅ Selesai |
| RAB Perbaikan      | ✅ Selesai |
| SPK Pekerjaan      | ✅ Selesai |
| BA Perbaikan       | 🚧 Belum   |

---

## 📌 Penutup

Aplikasi ini dirancang untuk mendukung efisiensi dalam pelaporan, pengelolaan biaya, dan dokumentasi perbaikan kendaraan operasional.

🧠 Dibuat sebagai proyek akhir **Sistem Informasi Korporasi**  
🧑‍💻 Oleh: **Aris Nur Mahendra**  
📆 Tahun: 2025
