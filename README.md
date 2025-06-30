# 🚗 Sistem Informasi Maintenance Kendaraan Operasional

Sistem berbasis Web + Spreadsheet untuk mendukung proses pelaporan kerusakan kendaraan, perencanaan perbaikan (RAB), dan dokumentasi administratif seperti SPK, Berita Acara, dan Invoice.

---

## 📄 Template Spreadsheet

📌 Gunakan template berikut untuk memulai:  
🔗 [Template Spreadsheet](https://docs.google.com/spreadsheets/d/1W45voTxTFQO3JpOsN0rFJ8bmVUpx8HCW_be6eMYsd_0/edit#gid=0)  
☑️ Salin spreadsheet ke akun Google Drive Anda melalui `File > Buat Salinan`.

---

## 📂 Struktur Sheet & Penjelasan

### 🧾 `laporan`
Laporan kerusakan kendaraan dari pengguna.
| Kolom               | Keterangan                                 |
|---------------------|---------------------------------------------|
| uid                 | ID unik laporan                             |
| user                | Nama pengguna                               |
| tanggal_lapor       | Tanggal pelaporan                           |
| odo_meter           | KM saat dilaporkan                          |
| plat_kr             | Plat kendaraan                              |
| deskripsi           | Uraian kerusakan                            |
| image_lapor         | Link Google Drive (bukti kerusakan)         |
| rencana_perbaikan   | Checkbox pilihan tindakan perbaikan         |
| tanggal_perbaikan   | Tanggal rencana perbaikan                   |
| image_perbaikan     | Gambar hasil perbaikan                      |
| status_perbaikan    | `Open`, `Process`, `Close` (otomatis)       |
| ref_rab, ref_spk, ref_ba, ref_invoice | Relasi ke dokumen lain    |
| deleted             | Soft delete flag                            |

---

### 📊 `resume`
Merangkum jumlah entri per status dokumen seperti RAB, SPK, dan BA.

| Kolom              | Keterangan                          |
|--------------------|--------------------------------------|
| #LAPORAN           | Jumlah laporan berdasarkan status    |
| #BAPP              | Jumlah BAPP                          |
| #SPK               | Jumlah SPK                           |
| #BA                | Jumlah Berita Acara                  |

---

### 🛠️ `harsat`
Daftar harga satuan barang perbaikan.

| Kolom           | Keterangan              |
|-----------------|--------------------------|
| uid             | ID unik                  |
| nama_barang     | Nama item/barang         |
| harga_barang    | Harga satuan             |
| satuan_barang   | Unit (liter, pcs, dll)   |
| jenis_barang    | Kategori barang          |
| deleted         | Soft delete              |

---

### 📁 `no_rab`
Header dokumen RAB per kendaraan.

| Kolom         | Keterangan                               |
|---------------|-------------------------------------------|
| no_rab        | Nomor dokumen RAB                         |
| tanggal_rab   | Tanggal dokumen                           |
| plat_kr       | Nomor polisi kendaraan                    |
| total_rab     | Total nilai dari sheet `rab`              |
| no_spk, no_ba | Nomor referensi dokumen lanjutan          |
| keterangan    | Deskripsi umum                            |
| status_rab    | `Open`, `Approved`, `Done`                |
| ref_rab       | Referensi laporan                         |
| ref_spk, ref_ba | Relasi dokumen lainnya                  |
| deleted       | Soft delete                               |

---

### 📄 `rab`
Detail item dari dokumen RAB (berelasi ke `no_rab`).

| Kolom         | Keterangan                                 |
|---------------|---------------------------------------------|
| uid_rab       | ID detail RAB                               |
| uid_laporan   | Referensi laporan kerusakan (`laporan.uid`) |
| no_rab        | Referensi ke sheet `no_rab.no_rab`          |
| tanggal_rab   | Tanggal input RAB                           |
| item_nama     | Nama barang                                 |
| item_qty      | Jumlah                                      |
| item_satuan   | Unit barang                                 |
| item_harga    | Harga satuan                                |
| item_total    | Total (qty × harga)                         |
| keterangan    | Catatan                                     |
| status_rab    | Status item                                 |
| deleted       | Soft delete                                 |

---

### 📃 `no_spk` dan `no_ba`
Dokumen pendukung setelah RAB (SPK, Berita Acara).

| Kolom         | Keterangan                                 |
|---------------|---------------------------------------------|
| no_spk / no_ba| Nomor dokumen                               |
| tanggal_spk / tanggal_ba | Tanggal terbit                   |
| keterangan    | Penjelasan                                 |
| status_spk / status_ba | Status dokumen                    |
| ref_rab, ref_spk, ref_ba | Relasi antar dokumen             |
| deleted       | Soft delete                                |

---

### 📈 `analytics_maintenance`
Hasil analisis data maintenance kendaraan.

| Kolom           | Keterangan                                     |
|-----------------|-------------------------------------------------|
| plat_kr         | Nomor kendaraan                                 |
| total_waktu     | Total hari dari laporan hingga perbaikan selesai|
| rata2_waktu     | Rata-rata waktu perbaikan                       |
| jumlah_kerusakan| Jumlah laporan per kendaraan                    |
| periode         | Rentang waktu (bulan/tahun)                     |

---

## 🧩 Fitur Aplikasi

- 🔧 **Pelaporan & RAB**: Form online lengkap untuk input laporan kerusakan dan buat RAB berdasarkan `harsat`
- 📎 **Dokumentasi**: Unggah & simpan bukti ke Google Drive (kerusakan, perbaikan, SPK, BA)
- 📋 **Status Otomatis**: Sistem cerdas menentukan status berdasarkan kelengkapan
- 👥 **Manajemen User**: Tambah user dengan akses terbatas sesuai menu (public, admin, izusu, dll)
- 📊 **Analitik**: Dashboard & Sheet `analytics_maintenance` untuk insight dan evaluasi

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

## 💡 Tips Teknis

- Gunakan `google.script.run.getHarsat()` untuk mengisi data harga otomatis saat memilih item
- Gunakan `UID + Timestamp` untuk membuat ID unik (`UID123456`)
- Gunakan `SweetAlert2` untuk UX responsif saat upload gambar
- DataTables digunakan untuk menampilkan laporan & RAB secara interaktif

---

## 👨‍💻 Kontribusi

Pull request, fitur baru, dan perbaikan bug sangat diterima. Pastikan untuk menyertakan dokumentasi singkat pada setiap perubahan besar.

---

## 📌 Penutup

Aplikasi ini dirancang untuk mendukung efisiensi dalam pelaporan, pengelolaan biaya, dan dokumentasi perbaikan kendaraan operasional.

🧠 Dibuat sebagai proyek akhir **Sistem Informasi Korporasi**  
🧑‍💻 Oleh: **Aris Nur Mahendra**  
📆 Tahun: 2025
