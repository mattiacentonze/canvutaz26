(() => {
  'use strict';

  const CONFIG = window.USA26_CONFIG || { APPS_SCRIPT_URL: '', GOOGLE_SHEET_URL: '', PUBLIC_EDIT_MODE: false, READ_ONLY_MODE: true };
  const IS_PUBLIC_EDIT = CONFIG.PUBLIC_EDIT_MODE === true && CONFIG.READ_ONLY_MODE !== true;
  const STORAGE_KEY = 'usa26-roadtrip-data-v2';
  const CATEGORY_LABELS = {
    sight: 'Vista', food: 'Food', drive: 'Guida', park: 'Parco', booking: 'Booking', warning: 'Warning', other: 'Altro', hotel: 'Alloggio', cost: 'Costo', note: 'Nota'
  };

  const DEFAULT_DATA = {
    meta: {
      tripName: 'USA26 Roadtrip',
      travelers: 3,
      currency: 'USD',
      startDate: '2026-07-04',
      endDate: '2026-07-12',
      routeUrl: 'https://www.google.com/maps/dir/San+Francisco,+CA/Santa+Barbara,+CA/Los+Angeles,+CA/Las+Vegas,+NV/Grand+Canyon+Village,+AZ/Page,+AZ/Zion+National+Park,+UT/Salt+Lake+City,+UT'
    },
    days: [
      {
        id: 'd04', date: '2026-07-04', label: 'Sab 4 lug', title: 'San Francisco', from: 'San Francisco', to: 'San Francisco', drive: '0h', driveHours: 0,
        summary: 'Primo giorno pieno a San Francisco. Tenere la giornata elastica per jet lag, meeting del gruppo e 4 luglio.',
        lodging: 'San Francisco', warning: 'Il 4 luglio può esserci più traffico/eventi: verificare strade chiuse e zone waterfront.'
      },
      {
        id: 'd05', date: '2026-07-05', label: 'Dom 5 lug', title: 'San Francisco', from: 'San Francisco', to: 'San Francisco', drive: '0h', driveHours: 0,
        summary: 'Secondo giorno pieno. Buono per Alcatraz, Golden Gate Park, Mission e vista da Twin Peaks.', lodging: 'San Francisco', warning: 'Alcatraz va prenotata prima se la volete fare.'
      },
      {
        id: 'd06', date: '2026-07-06', label: 'Lun 6 lug', title: 'San Francisco → Santa Barbara', from: 'San Francisco', to: 'Santa Barbara', drive: '5h45–6h45', driveHours: 6.2,
        summary: 'Trasferimento lungo. La US-101 è la scelta più realistica; la costa/Hwy 1 è più scenica ma può allungare molto.', lodging: 'Santa Barbara', warning: 'Non caricare troppe soste: dovete arrivare lucidi a Santa Barbara.'
      },
      {
        id: 'd07', date: '2026-07-07', label: 'Mar 7 lug', title: 'Santa Barbara → Los Angeles', from: 'Santa Barbara', to: 'Los Angeles', drive: '1h45–2h30', driveHours: 2.2,
        summary: 'Mattina a Santa Barbara, poi ingresso a LA. Visita molto compressa: scegliere 2–3 zone massimo.', lodging: 'Los Angeles', warning: 'LA non è una città da “vedere tutta” in un giorno. Evitare zig-zag inutili.'
      },
      {
        id: 'd08', date: '2026-07-08', label: 'Mer 8 lug', title: 'Los Angeles → Las Vegas', from: 'Los Angeles', to: 'Las Vegas', drive: '4h30–5h30', driveHours: 5,
        summary: 'Trasferimento nel deserto. Arrivo a Las Vegas per Strip, Bellagio, Sphere/Fremont se avete energia.', lodging: 'Las Vegas', warning: 'Partire non troppo tardi: traffico LA + caldo nel Mojave.'
      },
      {
        id: 'd09', date: '2026-07-09', label: 'Gio 9 lug', title: 'Las Vegas → Grand Canyon South Rim', from: 'Las Vegas', to: 'Grand Canyon South Rim', drive: '4h30–5h', driveHours: 4.8,
        summary: 'Giornata di trasferimento verso il South Rim. Obiettivo: arrivare per il tramonto.', lodging: 'Grand Canyon / Tusayan / Williams', warning: 'Comprare/usare America the Beautiful Pass: per 3 italiani conviene quasi subito.'
      },
      {
        id: 'd10', date: '2026-07-10', label: 'Ven 10 lug', title: 'Grand Canyon → Page / Antelope', from: 'Grand Canyon South Rim', to: 'Page', drive: '2h30–3h30', driveHours: 3,
        summary: 'Alba o mattina al Grand Canyon, uscita via Desert View Drive e arrivo a Page per Horseshoe Bend/Antelope.', lodging: 'Page', warning: 'Antelope Canyon non si visita da soli: serve tour guidato prenotato.'
      },
      {
        id: 'd11', date: '2026-07-11', label: 'Sab 11 lug', title: 'Page → Zion', from: 'Page', to: 'Zion / Springdale', drive: '2h15–3h', driveHours: 2.7,
        summary: 'Mattina Antelope se non fatto il giorno prima, poi Zion via Mt. Carmel Highway. Zion sarà un assaggio.', lodging: 'Springdale / Hurricane / La Verkin', warning: 'A Zion in alta stagione serve shuttle per il canyon principale.'
      },
      {
        id: 'd12', date: '2026-07-12', label: 'Dom 12 lug', title: 'Zion → Salt Lake City', from: 'Zion / Springdale', to: 'Salt Lake City', drive: '4h30–5h', driveHours: 4.8,
        summary: 'Ultimo trasferimento verso SLC. Possibile mattina leggera a Zion solo se partite presto.', lodging: 'Salt Lake City / Park City', warning: 'Non sottovalutare la guida finale: arrivo verosimilmente pomeriggio/sera.'
      }
    ],
    activities: [
      { id: 'a0401', core: true, dayId: 'd04', start: '09:30', end: '11:00', title: 'Golden Gate Bridge + Crissy Field', place: 'San Francisco', category: 'sight', cost: 0, notes: 'Prima vista simbolica. Se c’è nebbia, tenere come piano elastico.', link: 'https://www.google.com/maps/search/Crissy+Field+San+Francisco' },
      { id: 'a0402', core: true, dayId: 'd04', start: '11:30', end: '13:00', title: 'Palace of Fine Arts + Marina', place: 'Marina District', category: 'sight', cost: 0, notes: 'Stop fotografico facile, vicino al Golden Gate.', link: 'https://www.google.com/maps/search/Palace+of+Fine+Arts' },
      { id: 'a0403', core: true, dayId: 'd04', start: '14:30', end: '17:30', title: 'Fisherman’s Wharf + Pier 39 + Lombard Street', place: 'North waterfront', category: 'sight', cost: 0, notes: 'Turistico ma comodo il primo giorno. Aggiungere cable car solo se code accettabili.', link: 'https://www.google.com/maps/search/Pier+39+Lombard+Street' },
      { id: 'a0404', core: true, dayId: 'd04', start: '19:00', end: '22:00', title: 'Sera 4 luglio sul waterfront', place: 'SF waterfront', category: 'other', cost: 0, notes: 'Verificare eventi e chiusure. Non contare troppo sull’auto in centro.', link: '' },

      { id: 'a0501', core: true, dayId: 'd05', start: '08:30', end: '12:00', title: 'Alcatraz Day Tour', place: 'Pier 33 / Alcatraz Island', category: 'booking', cost: 47.95, notes: 'Opzionale ma consigliato. Prenotare prima se vi interessa.', link: 'https://www.cityexperiences.com/san-francisco/city-cruises/alcatraz/tour-options/alcatraz-day-tour/' },
      { id: 'a0502', core: true, dayId: 'd05', start: '13:00', end: '15:00', title: 'Painted Ladies + Alamo Square', place: 'Alamo Square', category: 'sight', cost: 0, notes: 'Stop classico, veloce.', link: 'https://www.google.com/maps/search/Painted+Ladies+San+Francisco' },
      { id: 'a0503', core: true, dayId: 'd05', start: '15:30', end: '18:00', title: 'Mission District / Dolores Park', place: 'Mission', category: 'food', cost: 20, notes: 'Buona zona per burrito/caffè. Alternativa: Golden Gate Park.', link: 'https://www.google.com/maps/search/Mission+District+San+Francisco' },
      { id: 'a0504', core: true, dayId: 'd05', start: '19:00', end: '20:30', title: 'Twin Peaks al tramonto', place: 'Twin Peaks', category: 'sight', cost: 0, notes: 'Vista città se meteo pulito.', link: 'https://www.google.com/maps/search/Twin+Peaks+San+Francisco' },

      { id: 'a0601', core: true, dayId: 'd06', start: '07:30', end: '13:00', title: 'Partenza verso sud via US-101', place: 'San Francisco → San Luis Obispo', category: 'drive', cost: 0, notes: 'Scelta più realistica per arrivare a Santa Barbara senza giornata infinita.', link: 'https://www.google.com/maps/dir/San+Francisco,+CA/Santa+Barbara,+CA' },
      { id: 'a0602', core: true, dayId: 'd06', start: '13:00', end: '14:30', title: 'Pausa San Luis Obispo / Pismo Beach', place: 'Central Coast', category: 'food', cost: 25, notes: 'Sosta pranzo. Pismo Beach se volete mare; SLO se volete più praticità.', link: 'https://www.google.com/maps/search/San+Luis+Obispo+Pismo+Beach' },
      { id: 'a0603', core: true, dayId: 'd06', start: '17:00', end: '20:30', title: 'Santa Barbara waterfront + State Street', place: 'Santa Barbara', category: 'sight', cost: 0, notes: 'Passeggiata leggera, cena e notte.', link: 'https://www.google.com/maps/search/Santa+Barbara+State+Street+Stearns+Wharf' },

      { id: 'a0701', core: true, dayId: 'd07', start: '08:30', end: '10:30', title: 'Santa Barbara mattina', place: 'Santa Barbara', category: 'sight', cost: 0, notes: 'Stearns Wharf / Courthouse / caffè. Poi partire per LA.', link: 'https://www.google.com/maps/search/Santa+Barbara+Courthouse+Stearns+Wharf' },
      { id: 'a0702', core: true, dayId: 'd07', start: '12:30', end: '15:00', title: 'Beverly Hills + Rodeo Drive', place: 'Los Angeles', category: 'sight', cost: 0, notes: 'Stop iconico e relativamente semplice.', link: 'https://www.google.com/maps/search/Beverly+Hills+Rodeo+Drive' },
      { id: 'a0703', core: true, dayId: 'd07', start: '15:30', end: '17:00', title: 'Hollywood Boulevard / Griffith opzionale', place: 'Hollywood', category: 'sight', cost: 0, notes: 'Hollywood è più check rapido che visita lunga. Griffith solo se non c’è troppo traffico.', link: 'https://www.google.com/maps/search/Hollywood+Boulevard+Griffith+Observatory' },
      { id: 'a0704', core: true, dayId: 'd07', start: '18:00', end: '21:00', title: 'Santa Monica + Venice Beach', place: 'West LA', category: 'sight', cost: 0, notes: 'Scelta migliore per sera/tramonto. Occhio a parcheggio e traffico.', link: 'https://www.google.com/maps/search/Santa+Monica+Pier+Venice+Beach' },

      { id: 'a0801', core: true, dayId: 'd08', start: '08:30', end: '14:00', title: 'Guida LA → Las Vegas', place: 'Mojave Desert', category: 'drive', cost: 0, notes: 'Partire presto. Acqua in macchina. Pausa a Barstow/Baker se serve.', link: 'https://www.google.com/maps/dir/Los+Angeles,+CA/Las+Vegas,+NV' },
      { id: 'a0802', core: true, dayId: 'd08', start: '16:30', end: '19:30', title: 'Las Vegas Strip + Bellagio fountains', place: 'Las Vegas Strip', category: 'sight', cost: 0, notes: 'Serata classica. Se hotel lontano, valutare Uber/parcheggio.', link: 'https://www.google.com/maps/search/Bellagio+Fountains+Las+Vegas+Strip' },
      { id: 'a0803', core: true, dayId: 'd08', start: '20:00', end: '22:00', title: 'Sphere da fuori / evento se conviene', place: 'Sphere Las Vegas', category: 'booking', cost: 0, notes: 'Da fuori è gratis. Dentro serve biglietto evento.', link: 'https://www.thesphere.com/' },

      { id: 'a0901', core: true, dayId: 'd09', start: '08:00', end: '13:00', title: 'Las Vegas → Grand Canyon South Rim', place: 'Route 66 / Williams', category: 'drive', cost: 0, notes: 'Possibili soste: Hoover Dam rapida, Seligman/Williams. Non esagerare.', link: 'https://www.google.com/maps/dir/Las+Vegas,+NV/Grand+Canyon+Village,+AZ' },
      { id: 'a0902', core: true, dayId: 'd09', start: '16:30', end: '20:00', title: 'Grand Canyon South Rim + tramonto', place: 'Mather Point / Yavapai', category: 'park', cost: 0, notes: 'Ingresso coperto dal pass. Obiettivo: arrivare prima del tramonto.', link: 'https://www.google.com/maps/search/Mather+Point+Grand+Canyon' },

      { id: 'a1001', core: true, dayId: 'd10', start: '06:00', end: '08:00', title: 'Alba / morning viewpoints South Rim', place: 'Grand Canyon', category: 'park', cost: 0, notes: 'Se riuscite, alba o giro breve sul Rim Trail.', link: 'https://www.google.com/maps/search/Yavapai+Point+Grand+Canyon' },
      { id: 'a1002', core: true, dayId: 'd10', start: '09:00', end: '12:30', title: 'Desert View Drive → Page', place: 'Grand Canyon East Entrance', category: 'drive', cost: 0, notes: 'Soste: Grandview, Moran, Lipan, Desert View Watchtower.', link: 'https://www.google.com/maps/search/Desert+View+Watchtower' },
      { id: 'a1003', core: true, dayId: 'd10', start: '16:30', end: '18:00', title: 'Horseshoe Bend', place: 'Page, Arizona', category: 'sight', cost: 10, notes: 'Parcheggio a pagamento per auto. Camminata breve ma caldo forte.', link: 'https://www.google.com/maps/search/Horseshoe+Bend+Page+Arizona' },

      { id: 'a1101', core: true, dayId: 'd11', start: '08:30', end: '10:30', title: 'Antelope Canyon tour', place: 'Page / Navajo Nation', category: 'booking', cost: 95.5, notes: 'Lower Antelope stimato: tour + Navajo fee. Prenotare slot. Orari esatti da aggiornare.', link: 'https://navajonationparks.org/guided-tour-operators/antelope-canyon-tour-operators/' },
      { id: 'a1102', core: true, dayId: 'd11', start: '11:30', end: '14:30', title: 'Guida Page → Zion via Mt. Carmel Highway', place: 'Kanab / East Zion', category: 'drive', cost: 0, notes: 'Strada scenica entrando da est. Tenere acqua e snack.', link: 'https://www.google.com/maps/dir/Page,+AZ/Zion+National+Park,+UT' },
      { id: 'a1103', core: true, dayId: 'd11', start: '15:30', end: '19:30', title: 'Zion assaggio: shuttle / Riverside Walk / Pa’rus', place: 'Zion National Park', category: 'park', cost: 0, notes: 'Ingresso coperto dal pass. In luglio evitare hiking pesante nelle ore calde.', link: 'https://www.google.com/maps/search/Zion+National+Park+Visitor+Center' },

      { id: 'a1201', core: true, dayId: 'd12', start: '08:00', end: '10:30', title: 'Mattina leggera a Zion oppure partenza diretta', place: 'Zion / Springdale', category: 'park', cost: 0, notes: 'Dipende da quanto siete stanchi e dall’orario di arrivo desiderato a SLC.', link: '' },
      { id: 'a1202', core: true, dayId: 'd12', start: '10:30', end: '16:00', title: 'Guida Zion → Salt Lake City', place: 'I-15 North', category: 'drive', cost: 0, notes: 'Trasferimento finale. Arrivo realistico pomeriggio/sera.', link: 'https://www.google.com/maps/dir/Zion+National+Park,+UT/Salt+Lake+City,+UT' }
    ],
    costs: [
      { id: 'c01', core: true, category: 'Parchi', item: 'America the Beautiful Non-Resident Annual Pass', scope: 'Gruppo / veicolo', amount: 250, split: '≈ $83.33 a testa', notes: 'Copre Grand Canyon, Zion e altri parchi NPS/federali inclusi. Non copre Antelope/Horseshoe.' },
      { id: 'c02', core: true, category: 'San Francisco', item: 'Alcatraz Day Tour', scope: 'A persona', amount: 47.95, split: 'x chi lo fa', notes: 'Opzionale; prenotare in anticipo.' },
      { id: 'c03', core: true, category: 'Page', item: 'Lower Antelope Canyon', scope: 'A persona', amount: 80.50, split: 'x 3 se lo fate tutti', notes: 'Tour guidato. Verificare tasse/fee incluse in fase booking.' },
      { id: 'c04', core: true, category: 'Page', item: 'Navajo entry fee Antelope', scope: 'A persona', amount: 15, split: 'x 3 se non inclusa', notes: 'Fee Navajo separata secondo operatore/location.' },
      { id: 'c05', core: true, category: 'Page', item: 'Horseshoe Bend parking', scope: 'Per auto', amount: 10, split: '≈ $3.33 a testa', notes: 'National Park Pass non valido per il parcheggio.' },
      { id: 'c06', core: true, category: 'Auto', item: 'Benzina road trip', scope: 'Gruppo', amount: 320, split: 'Stima da rivedere', notes: 'Placeholder: aggiornare dopo scelta auto e miglia reali.' },
      { id: 'c07', core: true, category: 'Parcheggi', item: 'SF / LA / Vegas parking', scope: 'Gruppo', amount: 150, split: 'Stima prudente', notes: 'Molto variabile in base agli hotel.' }
    ],
    lodging: [
      { id: 'l01', core: true, dayId: 'd04', title: 'San Francisco', city: 'San Francisco', address: 'Da inserire', notes: 'Notte 4→5 luglio.' },
      { id: 'l02', core: true, dayId: 'd05', title: 'San Francisco', city: 'San Francisco', address: 'Da inserire', notes: 'Notte 5→6 luglio.' },
      { id: 'l03', core: true, dayId: 'd06', title: 'Santa Barbara', city: 'Santa Barbara', address: 'Da prenotare', notes: 'Base comoda: Downtown / waterfront se budget ok.' },
      { id: 'l04', core: true, dayId: 'd07', title: 'Los Angeles', city: 'Los Angeles', address: 'Da prenotare', notes: 'Scegliere zona in base alla partenza per Las Vegas: West Hollywood/Santa Monica sono belli ma possono allungare.' },
      { id: 'l05', core: true, dayId: 'd08', title: 'Las Vegas', city: 'Las Vegas', address: 'Da prenotare', notes: 'Controllare resort fee e parking fee.' },
      { id: 'l06', core: true, dayId: 'd09', title: 'Grand Canyon / Tusayan / Williams', city: 'South Rim area', address: 'Da prenotare', notes: 'Tusayan o dentro parco sono più comodi; Williams costa meno ma è lontana.' },
      { id: 'l07', core: true, dayId: 'd10', title: 'Page', city: 'Page, AZ', address: 'Da prenotare', notes: 'Base giusta per Antelope Canyon e Horseshoe Bend.' },
      { id: 'l08', core: true, dayId: 'd11', title: 'Springdale / Hurricane / La Verkin', city: 'Zion area', address: 'Da prenotare', notes: 'Springdale è più comoda ma più cara; Hurricane/La Verkin sono compromesso.' }
    ],
    car: [
      { id: 'car01', core: true, title: 'Noleggio auto', value: 'Pickup San Francisco / drop-off Salt Lake City', notes: 'Verificare one-way fee, guidatori aggiuntivi, assicurazioni e deposito carta.' },
      { id: 'car02', core: true, title: 'Guidatori', value: 'Da definire', notes: 'Inserire nomi, età, patente, eventuale patente internazionale.' },
      { id: 'car03', core: true, title: 'Bagagli', value: '3 persone + valigie', notes: 'Non prendere auto troppo piccola: tappe lunghe e caldo.' }
    ],
    docs: [
      { id: 'doc01', core: true, title: 'Passaporto + ESTA', status: 'Obbligatorio', notes: 'Portare copia digitale/offline.' },
      { id: 'doc02', core: true, title: 'Patente italiana', status: 'Obbligatorio per guidatori', notes: 'Valutare patente internazionale se richiesta/consigliata dal rental.' },
      { id: 'doc03', core: true, title: 'Carta di credito rental', status: 'Critica', notes: 'Deve essere accettata per deposito. Controllare nome intestatario.' },
      { id: 'doc04', core: true, title: 'Assicurazione viaggio / sanitaria', status: 'Critica', notes: 'USA: costi sanitari molto alti. Salvare polizza e numeri emergenza.' },
      { id: 'doc05', core: true, title: 'America the Beautiful Pass', status: 'Da comprare', notes: 'Un pass per il veicolo; portare documento del passholder.' }
    ],
    notes: [
      { id: 'n01', core: true, dayId: '', title: 'Regola di viaggio', notes: 'Questo piano è volutamente modulare: aggiungere attività, ma evitare giornate con più di 2–3 priorità reali.' }
    ],
    bookings: []
  };

  let state = deepClone(DEFAULT_DATA);
  let backendConnected = false;
  let activeTab = 'overview';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    wireTabs();
    wireForms();
    wireBackup();
    $('#printBtn')?.addEventListener('click', () => window.print());
    $('#mapsFullRoute').href = DEFAULT_DATA.meta.routeUrl;
    setupEditLinks();

    await loadData();
    populateDaySelects();
    renderAll();
  }

  function setupEditLinks() {
    const sheetUrl = CONFIG.GOOGLE_SHEET_URL || '#add';
    ['editSheetHero', 'editSheetLink'].forEach(id => {
      const link = document.getElementById(id);
      if (!link) return;
      link.href = sheetUrl;
      if (!CONFIG.GOOGLE_SHEET_URL) {
        link.removeAttribute('target');
        link.removeAttribute('rel');
      }
    });
  }

  async function copySheetLink() {
    const status = $('#sheetLinkStatus');
    if (!CONFIG.GOOGLE_SHEET_URL) {
      setStatus(status, 'Inserisci prima GOOGLE_SHEET_URL in config.js.', true);
      return;
    }
    try {
      await navigator.clipboard.writeText(CONFIG.GOOGLE_SHEET_URL);
      setStatus(status, 'Link Google Sheet copiato.');
    } catch (error) {
      setStatus(status, 'Copia non riuscita: copia manualmente il link da config.js.', true);
    }
  }


  async function loadData() {
    const local = readLocalData();
    state = local ? mergeData(DEFAULT_DATA, local) : deepClone(DEFAULT_DATA);

    if (CONFIG.APPS_SCRIPT_URL) {
      try {
        const remote = await jsonp(CONFIG.APPS_SCRIPT_URL, { action: 'get' }, 8500);
        if (remote && remote.ok !== false) {
          state = mergeData(state, normalizeRemote(remote.data || remote));
          backendConnected = true;
          writeLocalData(state);
        }
      } catch (error) {
        backendConnected = false;
        console.warn('Backend non disponibile, uso dati locali', error);
      }
    }
  }

  function normalizeRemote(remote) {
    const normalized = {};
    ['days', 'activities', 'lodging', 'costs', 'car', 'docs', 'notes', 'bookings'].forEach(key => {
      normalized[key] = Array.isArray(remote[key]) ? remote[key] : [];
    });
    normalized.meta = remote.meta && typeof remote.meta === 'object' ? remote.meta : {};
    return normalized;
  }

  function mergeData(base, overlay) {
    const result = deepClone(base);
    if (overlay.meta) result.meta = { ...result.meta, ...overlay.meta };
    ['days', 'activities', 'lodging', 'costs', 'car', 'docs', 'notes', 'bookings'].forEach(collection => {
      const map = new Map();
      (result[collection] || []).forEach(item => map.set(item.id, item));
      (overlay[collection] || []).forEach(item => {
        if (!item || !item.id) return;
        map.set(item.id, { ...map.get(item.id), ...item, core: item.core === true ? true : false });
      });
      result[collection] = Array.from(map.values());
    });
    return result;
  }

  function readLocalData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('LocalStorage non leggibile', error);
      return null;
    }
  }

  function writeLocalData(data = state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (error) { console.warn('LocalStorage non scrivibile', error); }
  }

  function wireTabs() {
    $$('.tab').forEach(button => {
      button.addEventListener('click', () => showTab(button.dataset.tab));
    });
  }

  function showTab(tabName) {
    activeTab = tabName;
    $$('.tab').forEach(button => button.classList.toggle('is-active', button.dataset.tab === tabName));
    $$('.tab-panel').forEach(panel => panel.classList.toggle('is-visible', panel.id === tabName));
    if (tabName === 'add') location.hash = 'add';
  }

  function wireForms() {
    const activityForm = $('#activityForm');
    if (activityForm) {
      activityForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!IS_PUBLIC_EDIT) {
          setStatus($('#activityStatus'), 'Modifica dal Google Sheet condiviso, non dal sito pubblico.', true);
          return;
        }
        const form = event.currentTarget;
        const item = objectFromForm(form);
        item.id = makeId('a');
        item.core = false;
        item.cost = parseNumber(item.cost);
        item.createdAt = new Date().toISOString();
        item.updatedAt = item.createdAt;
        await addItem('activities', item, $('#activityStatus'));
        form.reset();
        populateDaySelects();
      });
    }

    const quickForm = $('#quickForm');
    if (quickForm) {
      quickForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!IS_PUBLIC_EDIT) {
          setStatus($('#quickStatus'), 'Modifica dal Google Sheet condiviso, non dal sito pubblico.', true);
          return;
        }
        const form = event.currentTarget;
        const raw = objectFromForm(form);
        const collection = raw.collection;
        const item = {
          id: makeId(collection.slice(0, 1)),
          core: false,
          dayId: raw.dayId || '',
          title: raw.title,
          amount: parseNumber(raw.amount),
          link: raw.link,
          address: raw.link,
          notes: raw.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        if (collection === 'costs') {
          item.item = raw.title;
          item.category = 'Extra';
          item.scope = 'Da definire';
        }
        if (collection === 'lodging') {
          item.city = findDay(item.dayId)?.to || '';
        }
        await addItem(collection, item, $('#quickStatus'));
        form.reset();
        populateDaySelects();
      });
    }

    $('#dayFilter')?.addEventListener('change', renderItinerary);
    $('#copySheetLinkBtn')?.addEventListener('click', copySheetLink);
  }

  function wireBackup() {
    $('#exportJsonBtn').addEventListener('click', () => downloadFile('usa26-roadtrip-backup.json', JSON.stringify(state, null, 2), 'application/json'));
    $('#exportCsvBtn').addEventListener('click', () => downloadFile('usa26-activities.csv', toCsv(state.activities), 'text/csv;charset=utf-8'));
    $('#resetLocalBtn').addEventListener('click', () => {
      if (!confirm('Resettare i dati locali del browser? Le aggiunte salvate su Google Sheet non vengono cancellate.')) return;
      localStorage.removeItem(STORAGE_KEY);
      state = deepClone(DEFAULT_DATA);
      renderAll();
    });
    $('#importFile').addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        const imported = JSON.parse(await file.text());
        state = mergeData(DEFAULT_DATA, imported);
        writeLocalData(state);
        renderAll();
        alert('Backup importato nella copia locale.');
      } catch (error) {
        alert('File non valido. Import annullato.');
      }
    });
  }

  async function addItem(collection, item, statusEl) {
    state[collection] = state[collection] || [];
    state[collection].push(item);
    writeLocalData(state);
    renderAll();

    if (!IS_PUBLIC_EDIT) {
      setStatus(statusEl, 'Salvato solo localmente. La versione condivisa si modifica dal Google Sheet.');
      return;
    }

    if (CONFIG.APPS_SCRIPT_URL) {
      try {
        await submitToBackend({ action: 'upsert', collection, item });
        setStatus(statusEl, 'Salvato. Potrebbe servire qualche secondo per vederlo su altri dispositivi.');
      } catch (error) {
        setStatus(statusEl, 'Salvato in locale, ma il backend non ha risposto. Controlla config.js.', true);
      }
    } else {
      setStatus(statusEl, 'Salvato solo su questo browser. Per la versione condivisa modifica il Google Sheet.');
    }
  }

  async function deleteItem(collection, id) {
    if (!IS_PUBLIC_EDIT) {
      alert('Cancellazione disattivata dal sito pubblico. Modifica direttamente il Google Sheet condiviso.');
      return;
    }
    const item = (state[collection] || []).find(entry => entry.id === id);
    if (!item || item.core) return;
    if (!confirm('Eliminare questo elemento aggiunto?')) return;
    state[collection] = state[collection].filter(entry => entry.id !== id);
    writeLocalData(state);
    renderAll();
    if (CONFIG.APPS_SCRIPT_URL) {
      try { await submitToBackend({ action: 'delete', collection, id }); }
      catch (error) { console.warn('Delete backend failed', error); }
    }
  }

  function renderAll() {
    renderStats();
    renderOverview();
    renderItinerary();
    renderRoutes();
    renderCosts();
    renderLodging();
    renderDocs();
    renderBackendStatus();
  }

  function renderStats() {
    $('#statTravelers').textContent = String(state.meta.travelers || 3);
    $('#statDays').textContent = String(state.days.length);
    const driveHours = state.days.reduce((sum, day) => sum + (Number(day.driveHours) || 0), 0);
    $('#statDrive').textContent = `${Math.round(driveHours)}h`;
    $('#mapsFullRoute').href = state.meta.routeUrl || DEFAULT_DATA.meta.routeUrl;
  }

  function renderOverview() {
    const highlights = [
      `${state.days.length} giorni`,
      `${Math.round(state.days.reduce((sum, day) => sum + (Number(day.driveHours) || 0), 0))}h guida`,
      '1 pass parchi da $250',
      'Antelope da prenotare',
      'Zion con shuttle'
    ];
    $('#overviewHighlights').innerHTML = highlights.map(text => `<span class="pill">${escapeHtml(text)}</span>`).join('');
    $('#timelineMini').innerHTML = state.days.map(day => `
      <div class="timeline-mini__item">
        <strong>${escapeHtml(day.label)}</strong>
        <span>${escapeHtml(day.title)}</span>
      </div>
    `).join('');
  }

  function populateDaySelects() {
    const options = ['<option value="">Senza giorno specifico</option>'].concat(
      state.days.map(day => `<option value="${escapeAttr(day.id)}">${escapeHtml(day.label)} · ${escapeHtml(day.title)}</option>`)
    ).join('');

    $$('select[name="dayId"]').forEach(select => { select.innerHTML = options; });
    $('#dayFilter').innerHTML = ['<option value="all">Tutti i giorni</option>'].concat(
      state.days.map(day => `<option value="${escapeAttr(day.id)}">${escapeHtml(day.label)} · ${escapeHtml(day.title)}</option>`)
    ).join('');
  }

  function renderItinerary() {
    const filter = $('#dayFilter')?.value || 'all';
    const days = filter === 'all' ? state.days : state.days.filter(day => day.id === filter);
    $('#itineraryList').innerHTML = days.map(renderDayCard).join('');
    $$('.activity-delete').forEach(button => {
      button.addEventListener('click', () => deleteItem('activities', button.dataset.id));
    });
  }

  function renderDayCard(day) {
    const activities = state.activities
      .filter(activity => activity.dayId === day.id)
      .sort((a, b) => (a.start || '99:99').localeCompare(b.start || '99:99'));

    return `
      <article class="day-card" id="${escapeAttr(day.id)}">
        <aside class="day-card__side">
          <div class="day-date">${escapeHtml(day.label)} · ${formatDate(day.date)}</div>
          <h3>${escapeHtml(day.title)}</h3>
          <p class="day-route">${escapeHtml(day.summary || '')}</p>
          <div class="day-meta">
            <div class="day-meta__row"><span>Da</span><strong>${escapeHtml(day.from || '—')}</strong></div>
            <div class="day-meta__row"><span>A</span><strong>${escapeHtml(day.to || '—')}</strong></div>
            <div class="day-meta__row"><span>Guida</span><strong>${escapeHtml(day.drive || '—')}</strong></div>
            <div class="day-meta__row"><span>Notte</span><strong>${escapeHtml(day.lodging || '—')}</strong></div>
          </div>
          ${day.warning ? `<div class="day-warning">${escapeHtml(day.warning)}</div>` : ''}
        </aside>
        <div class="activities">
          ${activities.length ? activities.map(renderActivity).join('') : '<div class="empty-state">Nessuna attività inserita per questo giorno.</div>'}
        </div>
      </article>
    `;
  }

  function renderActivity(activity) {
    const cost = parseNumber(activity.cost);
    const meta = [];
    if (cost > 0) meta.push(`<span class="meta-chip">$${formatMoney(cost)}</span>`);
    if (activity.link) meta.push(`<a class="meta-chip" href="${escapeAttr(activity.link)}" target="_blank" rel="noopener">Link</a>`);
    if (!activity.core) meta.push('<span class="meta-chip">aggiunta</span>');

    return `
      <article class="activity-card">
        <div class="activity-card__time">${escapeHtml(formatTimeRange(activity.start, activity.end))}</div>
        <div class="activity-card__body">
          <div class="activity-card__topline">
            <span class="badge">${escapeHtml(CATEGORY_LABELS[activity.category] || activity.category || 'Altro')}</span>
            ${IS_PUBLIC_EDIT && !activity.core ? `<button class="icon-btn activity-delete" data-core="false" data-id="${escapeAttr(activity.id)}" title="Elimina attività aggiunta">×</button>` : ''}
          </div>
          <h4>${escapeHtml(activity.title || 'Senza titolo')}</h4>
          ${activity.place ? `<p class="activity-card__place">${escapeHtml(activity.place)}</p>` : ''}
          ${activity.notes ? `<p class="activity-card__notes">${escapeHtml(activity.notes)}</p>` : ''}
          ${meta.length ? `<div class="activity-card__meta">${meta.join('')}</div>` : ''}
        </div>
      </article>
    `;
  }

  function renderRoutes() {
    const routes = state.days.filter(day => (Number(day.driveHours) || 0) > 0);
    $('#routeList').innerHTML = routes.map(day => `
      <article class="route-card">
        <div>
          <span class="day-date">${escapeHtml(day.label)}</span>
          <h3>${escapeHtml(day.from)} → ${escapeHtml(day.to)}</h3>
        </div>
        <p>${escapeHtml(day.summary || '')}</p>
        <div class="route-card__time">${escapeHtml(day.drive || '')}</div>
      </article>
    `).join('');
  }

  function renderCosts() {
    const fixed = (state.costs || []).reduce((sum, item) => sum + (parseNumber(item.amount) || 0), 0);
    const perPerson = fixed / (state.meta.travelers || 3);
    $('#costSummary').innerHTML = `
      <div class="cost-box"><span>Stima tabella</span><strong>$${formatMoney(fixed)}</strong></div>
      <div class="cost-box"><span>Quota media</span><strong>$${formatMoney(perPerson)}</strong></div>
      <div class="cost-box"><span>Persone</span><strong>${escapeHtml(String(state.meta.travelers || 3))}</strong></div>
    `;

    $('#costTable').innerHTML = `
      <table>
        <thead><tr><th>Categoria</th><th>Voce</th><th>Ambito</th><th>Costo</th><th>Note</th></tr></thead>
        <tbody>
          ${(state.costs || []).map(item => `
            <tr>
              <td>${escapeHtml(item.category || 'Extra')}</td>
              <td><strong>${escapeHtml(item.item || item.title || '—')}</strong><br><span class="muted">${escapeHtml(item.split || '')}</span></td>
              <td>${escapeHtml(item.scope || '—')}</td>
              <td>${item.amount ? `$${formatMoney(item.amount)}` : '—'}</td>
              <td>${escapeHtml(item.notes || '')}${IS_PUBLIC_EDIT && !item.core ? ` <button class="icon-btn" data-delete-collection="costs" data-delete-id="${escapeAttr(item.id)}">×</button>` : ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    $$('[data-delete-collection="costs"]').forEach(button => button.addEventListener('click', () => deleteItem('costs', button.dataset.deleteId)));
  }

  function renderLodging() {
    $('#lodgingList').innerHTML = (state.lodging || []).map(item => {
      const day = findDay(item.dayId);
      return `
        <article class="info-card">
          <span class="day-date">${escapeHtml(day ? day.label : 'Data da definire')}</span>
          <h3>${escapeHtml(item.title || item.name || 'Alloggio')}</h3>
          <p><strong>Città:</strong> ${escapeHtml(item.city || day?.to || '—')}</p>
          <p><strong>Indirizzo:</strong> ${escapeHtml(item.address || 'Da inserire')}</p>
          ${item.amount ? `<p><strong>Costo:</strong> $${formatMoney(item.amount)}</p>` : ''}
          ${item.link ? `<p><a href="${escapeAttr(item.link)}" target="_blank" rel="noopener">Apri link</a></p>` : ''}
          ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ''}
          ${IS_PUBLIC_EDIT && !item.core ? `<button class="icon-btn" data-delete-collection="lodging" data-delete-id="${escapeAttr(item.id)}">×</button>` : ''}
        </article>
      `;
    }).join('');
    $$('[data-delete-collection="lodging"]').forEach(button => button.addEventListener('click', () => deleteItem('lodging', button.dataset.deleteId)));
  }

  function renderDocs() {
    $('#carList').innerHTML = (state.car || []).map(item => `
      <div class="info-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p><strong>${escapeHtml(item.value || '')}</strong></p>
        <p>${escapeHtml(item.notes || '')}</p>
      </div>
    `).join('');

    $('#docsList').innerHTML = (state.docs || []).map(item => `
      <div class="info-card">
        <h3>${escapeHtml(item.title)}</h3>
        <p><strong>${escapeHtml(item.status || '')}</strong></p>
        <p>${escapeHtml(item.notes || '')}</p>
      </div>
    `).join('');

    $('#notesList').innerHTML = (state.notes || []).length ? (state.notes || []).map(item => {
      const day = findDay(item.dayId);
      return `
        <div class="info-card">
          <span class="day-date">${escapeHtml(day ? day.label : 'Generale')}</span>
          <h3>${escapeHtml(item.title || 'Nota')}</h3>
          <p>${escapeHtml(item.notes || '')}</p>
          ${IS_PUBLIC_EDIT && !item.core ? `<button class="icon-btn" data-delete-collection="notes" data-delete-id="${escapeAttr(item.id)}">×</button>` : ''}
        </div>
      `;
    }).join('') : '<div class="empty-state">Nessuna nota.</div>';
    $$('[data-delete-collection="notes"]').forEach(button => button.addEventListener('click', () => deleteItem('notes', button.dataset.deleteId)));
  }

  function renderBackendStatus() {
    const configured = Boolean(CONFIG.APPS_SCRIPT_URL);
    const sheetConfigured = Boolean(CONFIG.GOOGLE_SHEET_URL);
    $('#backendStatus').innerHTML = `
      <div><strong>Modalità:</strong> ${configured ? 'Google Apps Script in sola lettura' : 'Dati statici/locali'}</div>
      <div><strong>Connessione ultima lettura:</strong> ${configured ? (backendConnected ? 'OK' : 'Non confermata') : 'Non applicabile'}</div>
      <div><strong>Modifica:</strong> ${sheetConfigured ? 'solo dal Google Sheet condiviso' : 'inserisci GOOGLE_SHEET_URL in config.js'}</div>
      <div class="muted">Il sito pubblico non invia modifiche al backend. Per aggiornare il piano condiviso, aprite il Google Sheet con account autorizzato e modificate le righe.</div>
    `;
  }

  function findDay(dayId) { return (state.days || []).find(day => day.id === dayId); }

  function objectFromForm(form) {
    return Object.fromEntries(new FormData(form).entries());
  }

  function makeId(prefix = 'id') {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  function parseNumber(value) {
    if (value === null || value === undefined || value === '') return 0;
    const parsed = Number(String(value).replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function formatMoney(value) {
    return parseNumber(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  }

  function formatDate(iso) {
    if (!iso) return '';
    const date = new Date(`${iso}T00:00:00`);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function formatTimeRange(start, end) {
    if (start && end) return `${start}–${end}`;
    if (start) return start;
    return 'Flessibile';
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function escapeAttr(value) { return escapeHtml(value); }

  function deepClone(value) { return JSON.parse(JSON.stringify(value)); }

  function setStatus(element, message, isError = false) {
    if (!element) return;
    element.textContent = message;
    element.classList.toggle('is-error', isError);
    window.setTimeout(() => { element.textContent = ''; element.classList.remove('is-error'); }, 7000);
  }

  function downloadFile(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function toCsv(rows) {
    const headers = ['dayId', 'start', 'end', 'title', 'place', 'category', 'cost', 'notes', 'link'];
    const lines = [headers.join(',')];
    rows.forEach(row => {
      lines.push(headers.map(key => csvCell(row[key])).join(','));
    });
    return lines.join('\n');
  }

  function csvCell(value) {
    const str = String(value ?? '');
    return `"${str.replace(/"/g, '""')}"`;
  }

  function jsonp(baseUrl, params = {}, timeoutMs = 8000) {
    return new Promise((resolve, reject) => {
      const callbackName = `usa26_jsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      const url = new URL(baseUrl);
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
      url.searchParams.set('callback', callbackName);

      const script = document.createElement('script');
      const timeout = window.setTimeout(() => cleanup(() => reject(new Error('JSONP timeout'))), timeoutMs);

      window[callbackName] = (data) => cleanup(() => resolve(data));
      script.onerror = () => cleanup(() => reject(new Error('JSONP network error')));
      script.src = url.toString();
      document.body.appendChild(script);

      function cleanup(done) {
        window.clearTimeout(timeout);
        delete window[callbackName];
        script.remove();
        done();
      }
    });
  }

  function submitToBackend(payload) {
    return new Promise((resolve, reject) => {
      if (!CONFIG.APPS_SCRIPT_URL) return resolve();

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = CONFIG.APPS_SCRIPT_URL;
      form.target = 'silentSubmitFrame';
      form.style.display = 'none';

      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'payload';
      input.value = JSON.stringify(payload);
      form.appendChild(input);
      document.body.appendChild(form);

      const iframe = $('#silentSubmitFrame');
      const timer = window.setTimeout(() => {
        form.remove();
        resolve();
      }, 1800);

      const onLoad = () => {
        window.clearTimeout(timer);
        iframe.removeEventListener('load', onLoad);
        form.remove();
        resolve();
      };

      iframe.addEventListener('load', onLoad);
      try { form.submit(); }
      catch (error) {
        window.clearTimeout(timer);
        iframe.removeEventListener('load', onLoad);
        form.remove();
        reject(error);
      }
    });
  }
})();
