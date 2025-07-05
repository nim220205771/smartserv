let ᗩrisՈurᗰahendra = "U2FsdGVkX1+vWwcA7uvOlHwMnggf/Cswg4yThdtRmGLk3VZtphIDG3JpOckEknjB";
let spreadsheetId = "1RWmQc_V-VlVxD8bV6WAJM2mzeXzq42yizzCc502DI3I";
let folderIMG = "1lxN8K8r1cuyFhFq4aoX42l7AL9_N_NeR"; //ganti dengan id folder untuk img
let folderPDF = "1iO3Z6ki05RLdBhQy3c4nOMFN4NtTouOt"; //ganti dengan id folder untuk pdf

/**
 * Fungsi utama untuk menangani permintaan GET
 * @param {Object} e - Objek event dari request
 * @returns {ContentService.TextOutput} - Respons dalam format JSON
 */
function doGet(e) {
  mode = e.parameter.mode; // Mendapatkan parameter 'action'
  id = e.parameter.id; // Mendapatkan parameter 'id' (jika ada)
  username = e.parameter.username;
  post = e.parameter.post;
  passkey = e.parameter.passkey;
  data = e.parameter.data ? JSON.parse(e.parameter.data) : {};

  if (mode === "akses" && post) {
    if (post === "getpass" && username) {
      response = {
        status: "success",
        message: "post getpass",
        data: akses_getpass(username)
      };
      return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    } else if (post === "setname" && data) {
      response = {
        status: "success",
        message: "post setname",
        data: akses_setname(data)
      };
      return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    } else if (post === "delname" && id) {
      response = { status: "success", data: akses_delname(id) };
      return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
    }
  } else if (e.parameter.page) {
    // HtmlService.createTemplateFromFile(e.parameter.page).evaluate()

    const template = HtmlService.createTemplateFromFile(e.parameter.page);
    const htmlOutput = template.evaluate();

    // Ambil konten HTML mentah
    let htmlContent = htmlOutput.getContent();

    // Inject script kembali secara manual
    htmlContent = htmlContent.replace(
      "</body>",
      `
    <script>
      // Semua kode JavaScript Anda di sini
      console.log("Script dijalankan setelah load!");
      function initPage() {
        console.log("Halaman siap!");
      }
      window.addEventListener('DOMContentLoaded', initPage);
    </script>
    </body>
  `
    );

    return HtmlService.createHtmlOutput(htmlContent).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).setSandboxMode(HtmlService.SandboxMode.IFRAME);
  }

  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setFaviconUrl(`https://drive.google.com/uc?id=13K5s_auMdcIpmYY65tYlbJbYu8ruQmTA&sz&export=download&format=png`)
    .setTitle("SmartServ")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

/**
 * Fungsi utama untuk menangani permintaan POST
 * @param {Object} e - Objek event dari request
 * @returns {ContentService.TextOutput} - Respons dalam format JSON
 */
function doPost(request) {
  mode = request.parameter.mode;
  post = request.parameter.post;
  payload = request.postData.contents ? JSON.parse(request.postData.contents) : {};
  if (payload.mode === "akses") {
    if (payload.post == "adduser" && payload.data) {
      return akses_adduser(
        payload.data.username,
        payload.data.passkey,
        payload.data.fullname,
        payload.data.menuadmin,
        payload.data.menuinsp,
        payload.data.menupicinsp,
        payload.data.menuplks,
        payload.data.menupicplks,
        payload.data.menudataaset,
        payload.data.menupicdataaset,
        payload.data.menuusers,
        payload.data.menuperson
      );
    } else if (payload.post == "edituser" && payload.data) {
      return akses_edituser(payload.data.uid, payload.data.menuadmin, payload.data.menuinsp, payload.data.menupicinsp, payload.data.menuplks, payload.data.menupicplks, payload.data.menudataaset, payload.data.menupicdataaset, payload.data.menuusers, payload.data.menuperson);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: false,
          message: JSON.stringify(payload.data)
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  } else {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: JSON.stringify(payload) })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Mengambil isi file HTML dan mengembalikannya sebagai string.
 *
 * Biasanya digunakan untuk `include()` bagian head, script, atau partial layout di HTML.
 *
 * @param {string} filename - Nama file HTML (tanpa ekstensi .html)
 * @returns {string} Isi file HTML
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Mengambil konten HTML dari file yang dinamai sesuai parameter.
 *
 * Digunakan untuk memuat halaman berdasarkan nama file HTML di folder script.
 * Akan menangkap error dan menampilkan alert jika file tidak ditemukan.
 *
 * @param {string} name - Nama file HTML yang ingin dimuat
 * @returns {string} Isi file HTML atau pesan error
 */
function getPage(name) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    return `<div class="alert alert-danger">Halaman "${name}" tidak ditemukan.</div>`;
  }
}

/**
 * Fungsi untuk mendapatkan data pengguna berdasarkan username
 * dari sheet 'users' dan 'usercontrol'.
 *
 * @param {string} user - Username pengguna yang dicari.
 * @returns {Array|null} - Data pengguna jika ditemukan, atau `null` jika tidak ditemukan.
 */
function akses_getpass(user) {
  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  var sheetNames = ["users"];
  var result = [];

  sheetNames.forEach(function (name) {
    var sheet = spreadsheet.getSheetByName(name);
    if (!sheet) return;

    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (decryptString(data[i][1]) == user && (!data[i][7] || data[i][7].toString().trim() === "")) {
        // Kolom ke-2 adalah username
        result.push(data[i]);
      }
    }
  });

  return result; // Bisa berisi 0, 1, atau lebih baris
}

/**
 * Fungsi untuk mengubah password pengguna berdasarkan UID.
 * @param {string} uid - ID unik pengguna.
 * @param {string} passkey - Password baru yang akan diatur.
 * @returns {boolean|null} - Mengembalikan `true` jika berhasil, atau `null` jika UID tidak ditemukan.
 */
function akses_setpass(uid, passkey) {
  var sheetName = "usercontrol";
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  var data = sheet.getDataRange().getValues(); // Mendapatkan semua data dari sheet

  // Iterasi melalui setiap baris untuk mencari UID
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == uid) {
      sheet.getRange(i + 1, 3).setValue(passkey); // Mengatur password di kolom ke-3
      return true; // Berhasil
    }
  }
  return null; // UID tidak ditemukan
}

/**
 * Fungsi untuk mengubah nama lengkap pengguna berdasarkan UID.
 * @param {string} uid - ID unik pengguna.
 * @param {string} fullname - Nama lengkap baru yang akan diatur.
 * @returns {boolean|null} - Mengembalikan `true` jika berhasil, atau `null` jika UID tidak ditemukan.
 */
function akses_setname(payload) {
  var sheetName = "users";
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  var data = sheet.getDataRange().getValues(); // Mendapatkan semua data dari sheet

  // Iterasi melalui setiap baris untuk mencari UID
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == payload.uid) {
      var values = [[encryptString(payload.name), payload.passkey, encryptString(payload.fullname), encryptString(payload.perusahaan), encryptString(payload.jabatan)]]; // 2D array, satu baris dengan 5 kolom
      sheet.getRange(i + 1, 2, 1, 5).setValues(values); // mulai dari kolom ke-2, 5 kolom
      // sheet.getRange(i + 1, 4).setValue(fullname); // Mengatur nama lengkap di kolom ke-4
      return true; // Berhasil
    }
  }
  return null; // UID tidak ditemukan
}

/**
 * Fungsi untuk menghapus pengguna berdasarkan UID.
 * @param {string} uid - ID unik pengguna.
 * @returns {boolean|null} - Mengembalikan `true` jika berhasil, atau `null` jika UID tidak ditemukan.
 */
function akses_delname(uid) {
  var sheetName = "usercontrol";
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  var data = sheet.getDataRange().getValues(); // Mendapatkan semua data dari sheet

  // Iterasi melalui setiap baris untuk mencari UID
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == uid) {
      // sheet.deleteRow(i + 1); // Menghapus baris pengguna
      sheet.getRange(i + 1, 14).setValue(getFormattedTimestamp());
      return true; // Berhasil
    }
  }
  return null; // UID tidak ditemukan
}

/**
 * Fungsi untuk menambahkan pengguna baru ke dalam sheet.
 * @param {string} username - Nama pengguna baru.
 * @param {string} passkey - Password pengguna baru.
 * @param {string} fullname - Nama lengkap pengguna baru.
 * @param {...boolean} menus - Hak akses menu untuk pengguna baru.
 */
function akses_adduser(username, passkey, fullname, menuadmin, menuinsp, menupicinsp, menuplks, menupicplks, menudataaset, menupicdataaset, menuusers, menuperson) {
  var sheetName = "usercontrol";
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  if (isValueInArray(username, getArrayCol(sheetName, "B")) == true) {
    return ContentService.createTextOutput(JSON.stringify({ status: "fail", message: "Username Sudah Ada!" })).setMimeType(ContentService.MimeType.JSON);
  }
  var startRow = getLastRow(sheetName); // Baris terakhir
  var uid = getLastUid(sheetName) + 1; // UID baru

  // Data pengguna baru
  const newRows = [[uid, encryptString(username), passkey, encryptString(fullname), menuadmin, menuinsp, menupicinsp, menuplks, menupicplks, menudataaset, menupicdataaset, menuusers, menuperson]];
  sheet.getRange(startRow + 1, 5, newRows.length, 9).insertCheckboxes();
  sheet.getRange(startRow + 1, 1, newRows.length, 13).setValues(newRows); // Menambahkan data pengguna baru
  SpreadsheetApp.flush(); // Ensure changes are applied

  return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data created" })).setMimeType(ContentService.MimeType.JSON);

  // return ContentService.createTextOutput(
  //     JSON.stringify({ success: false, message: JSON.stringify(payload) })
  //   ).setMimeType(ContentService.MimeType.JSON)
}

/**
 * Fungsi untuk memperbarui nilai kolom 5 hingga 13 pada baris tertentu di Google Sheets berdasarkan UID.
 *
 * @param {string|number} uid - Identitas unik pengguna (User ID) yang datanya ingin diubah.
 * @param {...boolean} menus - Hak akses menu.
 * @returns {Object} - Respons dalam format JSON yang menyatakan apakah pembaruan berhasil atau gagal.
 */
function akses_edituser(uid, menuadmin, menuinsp, menupicinsp, menuplks, menupicplks, menudataaset, menupicdataaset, menuusers, menuperson) {
  var sheetName = "usercontrol";
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  response = {
    status: "fail",
    message: "Data GAGAL di Ubah!"
  };
  var data = sheet.getDataRange().getValues(); // Mendapatkan semua data dari sheet
  const newValues = [menuadmin, menuinsp, menupicinsp, menuplks, menupicplks, menudataaset, menupicdataaset, menuusers, menuperson];
  // Iterasi melalui setiap baris untuk mencari UID
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == uid) {
      // Update hanya kolom 5-13 pada baris yang sesuai
      sheet.getRange(i + 1, 5, 1, newValues.length).setValues([newValues]);
      response.status = "success";
      response.message = "Data berhasil diubah!";
      break; // Keluar dari loop setelah UID ditemukan dan diubah
    }
  }
  SpreadsheetApp.flush(); // Ensure changes are applied

  Logger.log(response);

  return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mengecek apakah sheet 'users' hanya berisi header (1 baris).
 * Jika iya, akan menambahkan 1 user default terenkripsi.
 *
 * @returns {boolean} True jika data default ditambahkan, false jika tidak.
 */
function checkAndInsertDefaultUser() {
  const ss = SpreadsheetApp.openById(spreadsheetId); // ganti dengan ID jika belum global
  const sheet = ss.getSheetByName("users");

  // Ambil data dari A2:H
  const data = sheet.getDataRange().getValues();
  Logger.log("data : " + data);

  // Filter hanya baris yang tidak kosong
  const nonEmptyData = data.filter(row => row.some(cell => cell !== ""));
  // Logger.log("nonEmptyData : "+nonEmptyData)
  Logger.log("nonEmptyData.length : " + nonEmptyData.length);
  // Jika kurang dari 1 data, tambahkan default
  if (nonEmptyData.length == 1) {
    Logger.log("Add Data");
    const newRow = [1, "U2FsdGVkX1/I4jY+MsVR8b+0xVMh1zWARCJO/LD3wDU=", "U2FsdGVkX19pwgk7VGxkeu+Cq3L/TuUyT9WxtliF3kQ=", "U2FsdGVkX18omLo0bgBZTQcYV2fj1pLuPIZIHIcItvw=", "AIS JOMO", "Development", '["menu-users","menu-person","menu-admin","menu-izusu","menu-gsais","menu-public"]', ""];

    sheet.getRange(sheet.getLastRow() + 1, 1, 1, newRow.length).setValues([newRow]);
    return true;
  } else {
    return false;
  }
}
