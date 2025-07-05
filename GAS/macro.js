/**
 * Mengenkripsi pesan menggunakan AES dan secret key.
 *
 * @param {string} message - Pesan yang akan dienkripsi.
 * @param {string} secretKey - Kunci rahasia untuk enkripsi.
 * @returns {string} Hasil enkripsi dalam format string.
 */
function encryptString(message) {
  var cipher = new cCryptoGS.Cipher(ᗩrisՈurᗰahendra, "aes");
  return cipher.encrypt(message);
}

/**
 * Mendekripsi pesan terenkripsi menggunakan AES dan secret key.
 *
 * @param {string} encryptedMessage - Pesan terenkripsi.
 * @param {string} secretKey - Kunci rahasia untuk dekripsi.
 * @returns {string} Pesan yang didekripsi.
 */
function decryptString(encryptedMessage) {
  var cipher = new cCryptoGS.Cipher(ᗩrisՈurᗰahendra, "aes");
  return cipher.decrypt(encryptedMessage);
}

/**
 * Mengambil semua data pengguna dari sheet "users" yang belum dihapus.
 * 
 * - Mengabaikan baris dengan kolom `deleted` terisi
 * - Jika kolom `asis` ada, akan didekode menggunakan `decryptString` dan diparse sebagai JSON
 *
 * @returns {Object[]} Array objek user aktif
 */
function getUsers() {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("users");

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const users = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const deleted = row[headers.indexOf("deleted")];

    if (!deleted || deleted === "") {
      let user = {};
      headers.forEach((h, j) => {
        if (h === "asis") {
          try {
            user[h] = JSON.parse(decryptString(row[j]) || "[]");
          } catch (e) {
            user[h] = [];
          }
        } else {
          user[h] = row[j];
        }
      });
      users.push(user);
    }
  }

  return users;
}

/**
 * Menambahkan data pengguna baru ke sheet "users".
 * 
 * - Mengisi `uid` sebagai angka baris terakhir (dalam bentuk string)
 * - Mengisi data sesuai urutan header di baris pertama sheet
 *
 * @param {Object} user - Objek data user yang akan ditambahkan
 */
function addUser(user) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("users");

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getLastRow();

  user.uid = lastRow.toString(); // uid = row terakhir (angka) sebagai string

  const rowData = headers.map(h => {
    return user[h] || "";
  });

  sheet.appendRow(rowData);
}

/**
 * Memperbarui data pengguna berdasarkan nilai `uid`.
 * 
 * - Jika `uid` ditemukan di kolom pertama, baris tersebut diperbarui sesuai properti pada objek `user`
 * - Hanya kolom yang sesuai dengan header dan tersedia di `user` yang diperbarui
 *
 * @param {Object} user - Objek user yang mengandung `uid` dan data baru
 * @returns {boolean} `true` jika update berhasil, `false` jika UID tidak ditemukan
 */
function updateUser(user) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == user.uid) {
      for (let j = 0; j < headers.length; j++) {
        let key = headers[j];
        if (key in user) {
          let value = user[key];
          sheet.getRange(i + 1, j + 1).setValue(value);
        }
      }
      return true;
    }
  }
  return false;
}

/**
 * Menandai user sebagai dihapus dengan mengisi kolom `deleted` di sheet.
 * 
 * - UID dicocokkan pada kolom pertama
 * - Kolom `deleted` diisi timestamp ISO saat penghapusan
 *
 * @param {string|number} uid - UID unik user yang ingin dihapus
 * @returns {boolean} `true` jika penghapusan berhasil, `false` jika UID tidak ditemukan
 */
function deleteUser(uid) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("users");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const deletedIndex = headers.indexOf("deleted");

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == uid) {
      const timestamp = new Date().toISOString(); // atau bisa pakai "true"
      sheet.getRange(i + 1, deletedIndex + 1).setValue(timestamp);
      return true;
    }
  }
  return false;
}

/**
 * Mengambil semua data dari sheet "harsat" yang belum ditandai sebagai deleted.
 *
 * @returns {Object[]} Array berisi item harga satuan yang aktif
 */
function getHarsat() {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("harsat");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const result = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[headers.indexOf("deleted")]) {
      let item = {};
      headers.forEach((h, j) => (item[h] = row[j]));
      result.push(item);
    }
  }
  return result;
}

/**
 * Menambahkan item harga satuan baru ke sheet "harsat".
 *
 * - UID ditentukan berdasarkan nomor baris terakhir (sebagai string)
 * - Kolom disesuaikan dengan header di baris pertama
 *
 * @param {Object} item - Objek berisi data harga satuan baru
 */
function addHarsat(item) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("harsat");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const lastRow = sheet.getLastRow(); // row terakhir sebelum append
  item.uid = lastRow.toString(); // uid = row terakhir (dalam bentuk string)

  const row = headers.map(h => item[h] || "");
  sheet.appendRow(row);
}

/**
 * Memperbarui data harga satuan berdasarkan UID.
 *
 * - Mencari baris berdasarkan `uid` (kolom pertama)
 * - Hanya memperbarui kolom yang tersedia di objek `item`
 *
 * @param {Object} item - Objek item dengan `uid` dan data yang akan diperbarui
 * @returns {boolean} True jika pembaruan berhasil, false jika UID tidak ditemukan
 */
function updateHarsat(item) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("harsat");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == item.uid) {
      headers.forEach((h, j) => {
        if (item[h] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(item[h]);
        }
      });
      return true;
    }
  }
  return false;
}

/**
 * Menghapus (soft delete) item harga satuan dengan menandai kolom "deleted" menggunakan timestamp ISO.
 *
 * @param {string|number} uid - UID unik item yang ingin dihapus
 * @returns {boolean} True jika penghapusan berhasil, false jika UID tidak ditemukan
 */
function deleteHarsat(uid) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("harsat");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const delIndex = headers.indexOf("deleted");

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == uid) {
      sheet.getRange(i + 1, delIndex + 1).setValue(new Date().toISOString());
      return true;
    }
  }
  return false;
}

/**
 * Mengambil data dari sheet "laporan" dan memfilternya berdasarkan status dan penghapusan.
 *
 * - Jika `promt === "Open"`, hanya menampilkan laporan dengan `status_perbaikan` === "Open"
 * - Mengabaikan baris dengan `deleted` terisi
 * - Hasil dikembalikan dalam bentuk JSON string
 *
 * @param {string|null} promt - Filter status, jika `"Open"` hanya ambil yang `status_perbaikan = "Open"`
 * @returns {string} JSON string array objek laporan
 */
function getLaporan(promt = null) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("laporan");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const deletedIndex = headers.indexOf("deleted");
  const statusIndex = headers.indexOf("status_perbaikan");

  return JSON.stringify(
    data
      .filter(row => {
        const notDeleted = !row[deletedIndex];
        const matchStatus = promt === "Open" ? row[statusIndex] === "Open" : true;
        return notDeleted && matchStatus;
      })
      .map(row => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      })
  );
}

/**
 * Mengunggah gambar dalam format Base64 (JPEG) ke Google Drive, lalu mengembalikan URL file-nya.
 *
 * @param {string} base64String - Data gambar base64 (harus diawali dengan `data:image/jpeg;base64,`)
 * @param {string} fileName - Nama file yang akan disimpan di Google Drive
 * @returns {string} URL publik file hasil upload
 * @throws {Error} Jika gagal membuat file di Drive
 */
function uploadBase64ImageToDrive(base64String, fileName) {
  try {
    const folderId = folderIMG;
    const folder = DriveApp.getFolderById(folderId);

    const contentType = "image/jpeg";
    const data = Utilities.base64Decode(base64String.replace(/^data:image\/jpeg;base64,/, ""));
    const blob = Utilities.newBlob(data, contentType, fileName);
    const file = folder.createFile(blob);

    return file.getUrl(); // Bisa juga gunakan file.getId() jika ingin link thumbnail
  } catch (err) {
    throw new Error("Upload gagal: " + err.message);
  }
}

/**
 * Menambahkan entri baru ke sheet "laporan".
 *
 * - UID akan otomatis di-generate dengan format: L001, L002, dst.
 * - Data diambil sesuai urutan header di baris pertama sheet
 *
 * @param {Object} item - Objek laporan baru berisi data lengkap kolom sheet
 */
function addLaporan(item) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("laporan");
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getLastRow();
  const nextNumber = lastRow; // atau lastRow + 1 jika ingin UID untuk baris berikutnya
  item.uid = "L" + nextNumber.toString().padStart(3, "0"); // Format: L001, L002, dst.
  const row = headers.map(h => item[h] || "");
  sheet.appendRow(row);
}

/**
 * Memperbarui laporan berdasarkan `uid` yang diberikan.
 *
 * - Otomatis menentukan `status_perbaikan` berdasarkan kelengkapan isian:
 *   - Jika semua field kosong: "Open"
 *   - Jika hanya referensi kosong: "Proccess"
 *   - Jika semua field terisi: "Close"
 *
 * @param {Object} item - Objek laporan yang ingin diperbarui, harus memiliki properti `uid`
 */
function updateLaporan(item) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("laporan");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const uidIndex = headers.indexOf("uid");

  // Deteksi dan logika status_perbaikan
  const requiredFields = ["rencana_perbaikan", "tanggal_perbaikan", "image_perbaikan", "ref_rab", "ref_spk", "ref_ba", "ref_invoice"];

  const isEmpty = key => !item[key] || item[key].toString().trim() === "";

  const allEmpty = requiredFields.every(isEmpty);
  const onlyRefsEmpty = ["ref_rab", "ref_spk", "ref_ba", "ref_invoice"].every(isEmpty);
  const allFilled = requiredFields.every(key => !isEmpty(key));

  if (allEmpty) {
    item.status_perbaikan = "Open";
  } else if (onlyRefsEmpty) {
    item.status_perbaikan = "Proccess";
  } else if (allFilled) {
    item.status_perbaikan = "Close";
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][uidIndex] == item.uid) {
      const row = headers.map(h => item[h] || "");
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return;
    }
  }
}

/**
 * Menandai laporan sebagai terhapus (soft delete) dengan mengisi kolom "deleted" menjadi "1".
 *
 * @param {string} uid - UID laporan yang ingin dihapus
 */
function deleteLaporan(uid) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("laporan");
  const data = sheet.getDataRange().getValues();
  const uidIndex = data[0].indexOf("uid");
  const deletedIndex = data[0].indexOf("deleted");

  for (let i = 1; i < data.length; i++) {
    if (data[i][uidIndex] == uid) {
      sheet.getRange(i + 1, deletedIndex + 1).setValue("1");
      return;
    }
  }
}

/**
 * Mengambil data rekap dari sheet "resume" dan mengembalikannya dalam format objek terstruktur.
 *
 * - Mengambil data dari range A2:B (laporan), D2:E (rab), G2:H (spk), dan J2:K (ba)
 * - Hanya memasukkan pasangan key-value yang tidak kosong
 *
 * @returns {Object} Objek hasil resume dengan struktur: { laporan: {}, rab: {}, spk: {}, ba: {} }
 */
function getResumeData() {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("resume");
  const lastRow = sheet.getLastRow();
  const result = { laporan: {}, rab: {}, spk: {}, ba: {} };

  const config = [
    { range: "A2:B", key: "laporan" },
    { range: "D2:E", key: "rab" },
    { range: "G2:H", key: "spk" },
    { range: "J2:K", key: "ba" }
  ];

  config.forEach(({ range, key }) => {
    const values = sheet.getRange(range + lastRow).getValues();
    values.forEach(([k, v]) => {
      if (k || v) result[key][k] = v;
    });
  });

  return result;
}

/**
 * Menyimpan data RAB baru ke sheet "rab" setelah menghapus entri lama dengan UID dan No. RAB yang sama.
 *
 * @param {string} uid_laporan - UID dari laporan kerusakan
 * @param {Object[]} rabItems - Array item RAB yang akan disimpan
 * @param {string} no_rab - Nomor RAB
 * @param {string} tanggal_rab - Tanggal pembuatan RAB
 */
function saveRAB(uid_laporan, rabItems, no_rab, tanggal_rab) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("rab");

  // Hapus data lama dengan UID & No RAB yang sama
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const newData = data.filter(row => !(row[0] === uid_laporan && row[1] === no_rab));
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (newData.length > 1) {
    sheet.getRange(2, 1, newData.length - 1, headers.length).setValues(newData.slice(1));
  }

  // Tambahkan data baru
  rabItems.forEach(item => {
    sheet.appendRow([uid_laporan, no_rab, tanggal_rab, item.item_nama, item.item_qty, item.item_satuan, item.item_harga, item.item_total, item.keterangan, "Draft"]);
  });
}

/**
 * Mengambil data laporan yang belum memiliki referensi RAB dan belum selesai diperbaiki.
 *
 * - Filter hanya `status_perbaikan` = "Open" atau "Process"
 * - `ref_rab` dan `deleted` harus kosong
 *
 * @returns {string} JSON string berisi array objek laporan yang valid untuk dibuatkan RAB
 */
function getRABLaporan() {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName("laporan");
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const index = {
    status_perbaikan: headers.indexOf("status_perbaikan"),
    ref_rab: headers.indexOf("ref_rab"),
    deleted: headers.indexOf("deleted")
  };

  const filtered = data.filter(row => {
    const status = row[index.status_perbaikan];
    const refRAB = row[index.ref_rab];
    const deleted = row[index.deleted];

    return (status === "Open" || status === "Process") && (!refRAB || refRAB === "") && (!deleted || deleted === "");
  });

  const result = filtered.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });

  return JSON.stringify(result);
}

/**
 * Mengambil daftar RAB dari sheet "no_rab", hanya data yang belum dihapus.
 *
 * @returns {string} JSON string berisi array objek RAB dengan detail plat, tanggal, status, dan referensi file
 */
function getNoRABList() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("no_rab");
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues();

  const result = data
    .filter(row => row[0] !== "") // hanya baris yang tidak kosong
    .filter(row => !row[11]) // deleted harus kosong
    .map((row, i) => ({
      uid: "UID" + (i + 1),
      no_rab: row[0],
      tanggal: row[1],
      plat_kr: row[2],
      total_rab: row[3],
      no_spk: row[4],
      no_ba: row[5],
      keterangan: row[6],
      status_rab: row[7],
      ref_rab: row[8],
      ref_spk: row[9],
      ref_ba: row[10]
    }));

  return JSON.stringify(result);
}

/**
 * Menyimpan detail data RAB ke sheet "rab".
 *
 * - Header field telah ditentukan tetap dan harus cocok dengan field objek input
 * - Field tambahan seperti constomer, plat_kr, warna_tahun, dll juga ikut disimpan
 *
 * @param {Object[]} data - Array objek RAB detail
 * @throws {Error} Jika sheet "rab" tidak ditemukan
 */
function saveRABDetailToSheet(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("rab");
  if (!sheet) throw new Error("Sheet 'rab' tidak ditemukan.");

  const headers = ["uid_rab", "uid_laporan", "no_rab", "tanggal_rab", "item_nama", "item_qty", "item_satuan", "item_harga", "item_total", "keterangan", "status_rab", "plat_kr", "constomer", "alamat", "no_rangka", "odo_meter", "warna_tahun", "deleted"];

  const existingData = sheet.getDataRange().getValues();
  const headerMap = existingData[0];

  const values = data.map(row => headers.map(h => row[h] || ""));

  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
}

/**
 * Mengambil data detail RAB berdasarkan nomor RAB.
 *
 * @param {string} no_rab - Nomor RAB yang ingin dicari
 * @returns {string} JSON string array berisi detail RAB
 * @throws {Error} Jika sheet "rab" tidak ditemukan
 */
function getRABByNoRAB(no_rab) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("rab");
  if (!sheet) throw new Error("Sheet 'rab' tidak ditemukan.");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1); // exclude header

  const matched = rows.filter(row => row[2] === no_rab); // kolom C = no_rab (index 2)

  const result = matched.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });

  return JSON.stringify(result); // ✅ JSON dari array of object
}

/**
 * Upload PDF ke Drive dan simpan URL-nya ke kolom dinamis di sheet tertentu.
 *
 * @param {string} base64File - File PDF dalam format base64 (data:application/pdf;base64,...)
 * @param {string} fileName - Nama file PDF yang akan disimpan
 * @param {string} targetSheet - Nama sheet (laporan / no_rab / no_ba / no_spk)
 * @param {string} targetUid - Nilai unik (uid / no_rab / no_ba / no_spk) sebagai kunci baris
 * @param {string} targetHeader - Nama kolom tempat menyimpan link (ref_rab / ref_spk / ref_ba / ...)
 * @returns {string} - URL publik dari file PDF
 */
function uploadPdfAndSetReference(base64File, fileName, targetSheet, targetUid, targetHeader) {
  const folderId = folderPDF; // Folder tujuan upload
  const folder = DriveApp.getFolderById(folderId);

  const blob = Utilities.newBlob(Utilities.base64Decode(base64File.split(",")[1]), "application/pdf", fileName);

  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const url = file.getUrl();

  // ⬇️ Tambahkan ke sheet "reference"
  const refSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("reference");
  if (!refSheet) throw new Error('Sheet "reference" tidak ditemukan');

  refSheet.appendRow([new Date(), targetSheet, targetUid, targetHeader, url]);

  return url;
}

/**
 * Mengambil data dari sheet "no_rab" untuk ditampilkan sebagai calon SPK.
 *
 * - Filter: status RAB harus "Open" dan belum dihapus (deleted kosong)
 *
 * @returns {string} JSON string array dari RAB yang siap dibuatkan SPK
 * @throws {Error} Jika sheet "no_rab" tidak ditemukan
 */
function getSPKRab() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("no_rab");
  if (!sheet) throw new Error("Sheet 'no_rab' tidak ditemukan.");

  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const idx = headers.reduce((acc, h, i) => {
    acc[h] = i;
    return acc;
  }, {});

  const result = data
    .filter(row => row[idx["status_rab"]] === "Open" && !row[idx["deleted"]])
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

  return JSON.stringify(result);
}

/**
 * Mengambil daftar semua SPK dari sheet "no_spk" yang belum dihapus.
 *
 * @returns {string} JSON string array berisi data SPK
 * @throws {Error} Jika sheet "no_spk" tidak ditemukan
 */
function getNoSPKList() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("no_spk");
  if (!sheet) throw new Error("Sheet 'no_spk' tidak ditemukan.");

  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // ambil header
  const idx = headers.reduce((o, h, i) => {
    o[h] = i;
    return o;
  }, {});
  const result = data
    .filter(row => row[idx["no_spk"]] !== "" && (row[idx["deleted"]] == "" || row[idx["deleted"]] == null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

  return JSON.stringify(result);
}

/**
 * Mengambil daftar kendaraan dari sheet "vehicles", hanya yang belum dihapus.
 *
 * @returns {string} JSON string array dari kendaraan aktif
 * @throws {Error} Jika sheet "vehicles" tidak ditemukan
 */
function getVehicles() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("vehicles");
  if (!sheet) throw new Error("Sheet 'vehicles' tidak ditemukan.");

  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // ambil header
  const idx = headers.reduce((o, h, i) => {
    o[h] = i;
    return o;
  }, {});

  const result = data
    .filter(row => !row[idx["deleted"]]) // hanya ambil yang belum dihapus
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      return obj;
    });

  return JSON.stringify(result);
}

/**
 * Mengambil data dasar SPK dari range O1:P8 pada sheet "resume".
 *
 * - Berisi informasi seperti nama rekanan dan tanggal perjanjian/addendum
 *
 * @returns {string} JSON string berupa array 2D [ [label, value], ... ]
 * @throws {Error} Jika sheet "resume" tidak ditemukan
 */
function getInfoSPK() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("resume");
  const range = sheet.getRange("O1:P8");
  const values = range.getValues(); // 8 baris x 2 kolom
  return JSON.stringify(values); // array 2D
}

/**
 * Menyimpan informasi dasar dokumen SPK ke sheet "resume" (range O1:P8).
 *
 * @param {Array[]} sourceData - Array 2D (8x2) berisi pasangan [label, value]
 * @returns {string} Pesan sukses
 * @throws {Error} Jika sheet "resume" tidak ditemukan
 */
function updateResumeDasarDokumen(sourceData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("resume");
  if (!sheet) throw new Error("Sheet 'resume' tidak ditemukan");

  // Ambil data dari O1:P8 (kolom 15 dan 16)
  const sourceRange = sheet.getRange("O1:P8");
  sourceRange.setValues(sourceData);

  return "Data dasar dokumen berhasil diperbarui.";
}

/**
 * Menyimpan data SPK ke sheet "no_spk".
 *
 * - Menambahkan entri baru dengan struktur tetap sesuai header
 * - Diperlukan saat menyimpan data SPK dari frontend
 *
 * @param {Object[]} data - Array objek SPK yang ingin disimpan
 * @throws {Error} Jika sheet "no_spk" tidak ditemukan
 */
function saveSPKDetailToSheet(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("no_spk");
  if (!sheet) throw new Error("Sheet 'rab' tidak ditemukan.");

  const headers = ["no_spk", "tanggal_spk", "keterangan", "status_spk", "no_rab", "no_ba", "ref_rab", "ref_spk", "ref_ba", "deleted"];

  const existingData = sheet.getDataRange().getValues();
  const headerMap = existingData[0];

  const values = data.map(row => headers.map(h => row[h] || ""));

  sheet.getRange(sheet.getLastRow() + 1, 1, values.length, headers.length).setValues(values);
}

/**
 * Menghapus (soft-delete) data SPK berdasarkan nomor SPK.
 *
 * - Menandai kolom "deleted" dengan tanggal saat ini
 *
 * @param {string} no_spk - Nomor SPK yang ingin dihapus
 * @returns {string} Pesan berhasil atau tidak ditemukan
 * @throws {Error} Jika sheet "no_spk" tidak ditemukan
 */
function deleteSPKByNo(no_spk) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("no_spk");
  if (!sheet) throw new Error("Sheet 'no_spk' tidak ditemukan.");

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idx = headers.reduce((obj, h, i) => {
    obj[h] = i;
    return obj;
  }, {});

  for (let i = 1; i < data.length; i++) {
    if (data[i][idx["no_spk"]] === no_spk && !data[i][idx["deleted"]]) {
      sheet.getRange(i + 1, idx["deleted"] + 1).setValue(new Date());
      return `SPK ${no_spk} berhasil dihapus`;
    }
  }

  return `SPK ${no_spk} tidak ditemukan atau sudah dihapus`;
}
