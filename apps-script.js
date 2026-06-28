/**
 * USA26 Roadtrip Planner v3.2 - Google Apps Script SOLO LETTURA.
 *
 * Tab richiesti nel Google Sheet:
 * giorni, cose_da_fare, alloggi, costi, auto_documenti, prenotazioni, link_utili, note
 *
 * Le colonne restano semplici. Le immagini sono solo URL di sfondo usati dal sito.
 */

const SHEET_ID = '1iVNIX-nnxr2rfs2V-vp7xQop9YIBeHqP4s21EpNOI3k';
const SHEET_HEADERS = {
  giorni: ['Data','Titolo giornata','Partenza','Arrivo','Guida stimata','Priorità del giorno','Da vedere','Google Maps','Immagini sfondo','Fonte immagini','Note'],
  cose_da_fare: ['Data','Luogo','Cosa fare','Categoria','Priorità','Costo stimato USD','Link utile','Immagine sfondo','Fonte immagine','Note'],
  alloggi: ['Data notte','Zona','Nome alloggio','Indirizzo','Link prenotazione','Costo stimato USD','Note'],
  costi: ['Categoria','Voce','Costo stimato USD','Pagamento','Link utile','Note'],
  auto_documenti: ['Categoria','Voce','Stato','Link utile','Note'],
  prenotazioni: ['Cosa prenotare','Per quando','Priorità','Costo stimato USD','Link utile','Stato','Note'],
  link_utili: ['Categoria','Nome','Link','Note'],
  note: ['Tema','Nota','Link utile']
};

function doGet(e) {
  try {
    const data = getPlannerData_();
    const payload = JSON.stringify({ ok: true, data });
    const callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(`${callback}(${payload});`).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    const payload = JSON.stringify({ ok: false, error: err && err.message ? err.message : String(err) });
    const callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService.createTextOutput(`${callback}(${payload});`).setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(payload).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSpreadsheet_() {
  try { return SpreadsheetApp.openById(SHEET_ID); } catch (e) {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
    throw new Error(`Impossibile aprire il Google Sheet ${SHEET_ID}: ${e && e.message ? e.message : e}`);
  }
}

function getPlannerData_() {
  const ss = getSpreadsheet_();
  const data = {
    meta: {
      'Titolo': 'USA26 Roadtrip Planner',
      'Periodo': '4–12 luglio 2026',
      'Persone': '3',
      'Sintesi': 'San Francisco → Santa Barbara → Los Angeles → Las Vegas → Grand Canyon → Page / Antelope → Zion → Salt Lake City',
      'Route Google Maps': 'https://www.google.com/maps/dir/San+Francisco,+CA/Santa+Barbara,+CA/Los+Angeles,+CA/Las+Vegas,+NV/Grand+Canyon+Village,+AZ/Page,+AZ/Zion+National+Park,+UT/Salt+Lake+City,+UT'
    }
  };
  Object.keys(SHEET_HEADERS).forEach(name => {
    const sheet = ss.getSheetByName(name);
    data[name] = sheet ? readSheet_(sheet) : [];
  });
  return data;
}

function readSheet_(sheet) {
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h || '').trim());
  return values.slice(1)
    .filter(row => row.some(cell => String(cell || '').trim() !== ''))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || '');
      return obj;
    });
}

function setupSheets() {
  const ss = getSpreadsheet_();
  Object.entries(SHEET_HEADERS).forEach(([name, headers]) => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.clear();
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  });
}
