/**
 * USA26 Roadtrip Planner — Google Apps Script backend READ-ONLY
 *
 * Scopo della v2:
 * - il sito pubblico legge i dati dal Google Sheet;
 * - il sito pubblico NON può scrivere nel foglio;
 * - solo gli account Google condivisi come Editor possono modificare il foglio direttamente.
 *
 * Setup consigliato:
 * 1. Crea un Google Sheet vuoto.
 * 2. Extensions → Apps Script.
 * 3. Incolla questo file.
 * 4. Esegui setupSheets() e autorizza.
 * 5. Condividi il Google Sheet solo con i due amici come Editor.
 * 6. Deploy → New deployment → Web app.
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Copia l'URL /exec in config.js come APPS_SCRIPT_URL.
 *
 * Nota: la Web App è pubblica solo in lettura. Non esiste doPost.
 */

const SPREADSHEET_ID = ''; // Lascia vuoto se lo script è collegato al Google Sheet.

const COLLECTIONS = ['days', 'activities', 'lodging', 'costs', 'car', 'docs', 'notes', 'bookings'];

const HEADERS = {
  days: ['id', 'date', 'label', 'title', 'from', 'to', 'drive', 'driveHours', 'summary', 'lodging', 'warning', 'createdAt', 'updatedAt'],
  activities: ['id', 'dayId', 'start', 'end', 'title', 'place', 'category', 'cost', 'notes', 'link', 'core', 'createdAt', 'updatedAt'],
  lodging: ['id', 'dayId', 'title', 'city', 'address', 'amount', 'link', 'notes', 'core', 'createdAt', 'updatedAt'],
  costs: ['id', 'category', 'item', 'title', 'scope', 'amount', 'split', 'notes', 'link', 'core', 'createdAt', 'updatedAt'],
  car: ['id', 'title', 'value', 'notes', 'link', 'core', 'createdAt', 'updatedAt'],
  docs: ['id', 'title', 'status', 'notes', 'link', 'core', 'createdAt', 'updatedAt'],
  notes: ['id', 'dayId', 'title', 'notes', 'link', 'core', 'createdAt', 'updatedAt'],
  bookings: ['id', 'dayId', 'title', 'amount', 'link', 'notes', 'core', 'createdAt', 'updatedAt']
};

function setupSheets() {
  const ss = getSpreadsheet_();
  COLLECTIONS.forEach(collection => ensureSheet_(ss, collection));
}

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const output = {
    ok: true,
    mode: 'read-only',
    updatedAt: new Date().toISOString(),
    data: readAll_()
  };
  return respond_(output, params.callback);
}

function readAll_() {
  const ss = getSpreadsheet_();
  const data = {};
  COLLECTIONS.forEach(collection => {
    ensureSheet_(ss, collection);
    data[collection] = readCollection_(ss, collection);
  });
  return data;
}

function getSpreadsheet_() {
  if (SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No active spreadsheet. Bind this script to a Google Sheet or set SPREADSHEET_ID.');
  return ss;
}

function ensureSheet_(ss, collection) {
  if (COLLECTIONS.indexOf(collection) === -1) throw new Error('Invalid collection: ' + collection);
  let sheet = ss.getSheetByName(collection);
  if (!sheet) sheet = ss.insertSheet(collection);

  const headers = HEADERS[collection];
  const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const isEmpty = firstRow.every(cell => cell === '');
  if (isEmpty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    const existing = firstRow.filter(Boolean).map(String);
    const missing = headers.filter(header => existing.indexOf(header) === -1);
    if (missing.length) {
      sheet.getRange(1, existing.length + 1, 1, missing.length).setValues([missing]);
    }
  }
  return sheet;
}

function readCollection_(ss, collection) {
  const sheet = ensureSheet_(ss, collection);
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow < 2) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(String);
  return values.slice(1).filter(row => row.some(cell => cell !== '')).map(row => {
    const item = {};
    headers.forEach((header, index) => {
      if (!header) return;
      const value = row[index];
      item[header] = normalizeCell_(value);
    });
    return item;
  });
}

function normalizeCell_(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === 'TRUE') return true;
  if (value === 'FALSE') return false;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function respond_(payload, callback) {
  const json = JSON.stringify(payload);
  if (callback) {
    return ContentService
      .createTextOutput(String(callback) + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
