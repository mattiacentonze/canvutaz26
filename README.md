# USA26 Roadtrip Planner — v2 read-only site + private Google Sheet

Sito statico pubblico per pianificare il viaggio USA26 dal 4 al 12 luglio 2026:

**San Francisco → Santa Barbara → Los Angeles → Las Vegas → Grand Canyon → Page / Antelope Canyon → Zion → Salt Lake City**

Questa v2 segue la scelta più sicura:

- il sito GitHub Pages è pubblico e in sola lettura;
- il piano si modifica da un Google Sheet condiviso solo con i 3 partecipanti;
- il sito legge il Google Sheet tramite Google Apps Script in sola lettura;
- non ci sono password nel sito;
- nessuno può scrivere nel foglio dal sito pubblico.

---

## File inclusi

```txt
index.html              # struttura del sito
style.css               # grafica responsive
app.js                  # logica planner, lettura dati, export/import locale
config.js               # configurazione URL backend + URL Google Sheet
config.example.js       # esempio configurazione compilata
apps-script.js          # backend Google Apps Script in sola lettura
sample-data.json        # esempio dati in JSON
README.md               # istruzioni
```

---

## 1. Pubblicazione su GitHub Pages

1. Crea un repository GitHub, ad esempio `usa26-roadtrip`.
2. Carica tutti i file nella root del repository.
3. Vai su **Settings → Pages**.
4. In **Build and deployment**, scegli:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Salva.
6. GitHub darà un URL tipo:

```txt
https://TUO-USERNAME.github.io/usa26-roadtrip/
```

---

## 2. Crea il Google Sheet privato

1. Crea un Google Sheet vuoto, ad esempio `USA26 Roadtrip Data`.
2. Condividilo solo con i due amici come **Editor**.
3. Non usare “Anyone with the link can edit”.
4. Non pubblicare il foglio sul web con permessi di modifica.

---

## 3. Configura Apps Script in sola lettura

1. Nel Google Sheet vai su **Extensions → Apps Script**.
2. Cancella il codice esistente.
3. Incolla tutto il contenuto di `apps-script.js`.
4. Salva.
5. Nel menu funzioni seleziona `setupSheets`.
6. Premi **Run** e autorizza lo script.

Lo script crea questi fogli:

- `days`
- `activities`
- `lodging`
- `costs`
- `car`
- `docs`
- `notes`
- `bookings`

Poi potete compilare le righe direttamente nel Google Sheet.

---

## 4. Pubblica la Web App solo lettura

In Apps Script:

1. **Deploy → New deployment**.
2. Tipo: **Web app**.
3. Imposta:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Premi **Deploy**.
5. Copia l’URL che finisce con `/exec`.

Questa Web App è pubblica, ma il file `apps-script.js` non contiene `doPost`: quindi dal sito si può solo leggere, non scrivere.

---

## 5. Collega sito e Google Sheet

Apri `config.js` e inserisci:

```js
window.USA26_CONFIG = {
  APPS_SCRIPT_URL: 'https://script.google.com/macros/s/XXXXXXXXXXXX/exec',
  GOOGLE_SHEET_URL: 'https://docs.google.com/spreadsheets/d/XXXXXXXXXXXX/edit',
  PUBLIC_EDIT_MODE: false,
  READ_ONLY_MODE: true,
  TRIP_NAME: 'USA26 Roadtrip'
};
```

Poi carica/modifica `config.js` nel repository GitHub.

Da quel momento:

- il sito pubblico legge i dati dal Google Sheet;
- solo gli account autorizzati possono modificare il Google Sheet;
- le modifiche diventano visibili sul sito dopo refresh.

---

## 6. Uso pratico

Per aggiungere una tappa o attività:

1. apri il sito;
2. vai su **Modifica**;
3. apri il Google Sheet;
4. aggiungi una riga nel foglio giusto, ad esempio `activities`;
5. ricarica il sito.

Colonne principali per `activities`:

```txt
id, dayId, start, end, title, place, category, cost, notes, link, core
```

Esempio:

```txt
id: a-custom-001
dayId: d07
start: 18:00
end: 21:00
title: Venice Beach al tramonto
place: Venice Beach
category: sight
cost: 0
notes: Passeggiata + cena leggera
link: https://www.google.com/maps/search/Venice+Beach
core: false
```

---

## 7. Backup

Dal tab **Backup** puoi scaricare:

- JSON completo;
- CSV attività.

Il backup non modifica il Google Sheet. Serve solo come copia locale o archivio.
