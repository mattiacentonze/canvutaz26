# USA26 Roadtrip Planner v3.1

Versione semplificata per Google Sheet, senza colonne tecniche e con consigli della guida della collega filtrati sul vostro itinerario 4–12 luglio.

## Cosa cambia nella v3.1

- Il sito GitHub Pages resta pubblico ma **in sola lettura**.
- Il piano si modifica solo da **Google Sheet privato**, condiviso solo con voi tre come Editor.
- Lo Sheet non richiede colonne tecniche: niente `id`, `created_at`, `updated_at`, `core`.
- Non ci sono orari: ogni giorno contiene cose da fare, priorità, costi e link; poi decidete sul momento.
- Sono stati integrati i consigli della guida della collega solo quando compatibili con il vostro giro.
- Sono stati esclusi i posti troppo fuori itinerario: Death Valley, Sequoia, Yosemite, Bakersfield/Fresno, Joshua Tree/Twentynine Palms, Monument Valley e Red Rock Canyon.

## Tab Google Sheet richiesti

Crea/importa questi tab, con questi nomi esatti:

- `giorni`
- `cose_da_fare`
- `alloggi`
- `costi`
- `auto_documenti`
- `prenotazioni`
- `link_utili`
- `note`

Non rinominare la prima riga. Potete modificare e aggiungere righe sotto.

## Import CSV

Dentro `csv-import/` trovi un CSV per ogni tab. Google Sheets non importa più tab da un singolo CSV, quindi importali uno alla volta nel tab corrispondente.

Procedura consigliata:

1. Crea un Google Sheet vuoto.
2. Apri `Estensioni → Apps Script`.
3. Incolla il contenuto di `apps-script.js`.
4. Esegui `setupSheets()` per creare i tab.
5. Importa ogni CSV nel tab corrispondente.
6. Condividi lo Sheet solo con i due amici come **Editor**.
7. Pubblica Apps Script come Web App in sola lettura.
8. Copia l'URL della Web App in `config.js` dentro `APPS_SCRIPT_URL`.
9. Copia il link dello Sheet in `config.js` dentro `GOOGLE_SHEET_URL`.
10. Fai commit e push su GitHub.

## Pubblicazione su GitHub Pages

```powershell
git add .
git commit -m "Update USA26 planner v31 filtered guide"
git push origin main
```

Poi controlla: `Settings → Pages → Branch main / root`.

## Cache

La v3.1 usa nuovi cache-buster in `index.html` e una nuova chiave `localStorage` (`usa26_v31_cache`). Dopo il push, fare `Ctrl+F5` sul sito.

## Sicurezza

Non mettere nel Google Sheet:

- numeri completi di passaporto;
- foto documenti;
- numeri carta;
- codici prenotazione completi;
- dati sanitari o personali sensibili.

Il sito è pubblico: tutto quello che il sito mostra è visibile a chi ha il link.
