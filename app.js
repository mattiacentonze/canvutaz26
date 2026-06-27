const CONFIG = window.USA26_CONFIG || { APPS_SCRIPT_URL: '', GOOGLE_SHEET_URL: '' };
const STORAGE_KEY = 'usa26_v32_cache';
let state = null;
let backendConnected = false;

const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const val = (o, k, fallback='') => (o && o[k] !== undefined && o[k] !== null) ? String(o[k]) : fallback;
const moneyNum = (x) => { const m = String(x || '').replace(',', '.').match(/\d+(\.\d+)?/); return m ? Number(m[0]) : 0; };
const fmtDate = (raw) => {
  if (!raw) return '';
  const s = String(raw).trim();
  let d = null;
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const it = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/);
  if (iso) d = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12);
  else if (it) d = new Date(Number(it[3]), Number(it[2]) - 1, Number(it[1]), 12);
  else d = new Date(s);
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString('it-IT', { weekday:'short', day:'2-digit', month:'short' }) : s;
};
const safe = (text='') => String(text).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const link = (url, label='Apri link') => url ? `<a href="${safe(url)}" target="_blank" rel="noopener">${safe(label)}</a>` : '<span class="muted">—</span>';

const splitImages = (raw='') => String(raw || '').split(/\s+\|\s+|[;\n]+/).map(x => x.trim()).filter(Boolean);
function imageList(row, field){
  const raw = field ? row[field] : (row['Immagini sfondo'] || row['Immagine sfondo'] || row['Immagini'] || '');
  return splitImages(raw).slice(0, 4);
}
function bgTile(url){ return `<span class="media-tile" style="background-image:url('${safe(url)}')"></span>`; }
function mediaBlock(urls){
  if(!urls || !urls.length) return '';
  const count = Math.min(urls.length, 4);
  return `<div class="card-media card-media--${count}">${urls.slice(0,4).map(bgTile).join('')}</div>`;
}


document.addEventListener('DOMContentLoaded', init);
async function init(){
  wireTabs();
  $('#printBtn')?.addEventListener('click', () => window.print());
  $('#copySheetLinkBtn')?.addEventListener('click', copySheetLink);
  $('#exportJsonBtn')?.addEventListener('click', exportJson);
  $('#exportCsvBtn')?.addEventListener('click', exportCsv);
  await loadData();
  setupLinks();
  populateDayFilter();
  renderAll();
}
function wireTabs(){ $$('.tab').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab))); }
function showTab(name){ $$('.tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === name)); $$('.tab-panel').forEach(p => p.classList.toggle('is-visible', p.id === name)); if(name==='edit') location.hash='edit'; }
async function loadData(){
  state = await fetch('sample-data.json?v=20260628-v32').then(r=>r.json());
  const cached = readCache(); if(cached) state = merge(state, cached);
  if(CONFIG.APPS_SCRIPT_URL){
    try{ const remote = await jsonp(CONFIG.APPS_SCRIPT_URL, { action:'get' }, 9000); if(remote && remote.ok !== false){ state = merge(state, remote.data || remote); backendConnected = true; writeCache(state); } }
    catch(e){ console.warn('Backend non disponibile, uso dati locali/sample', e); }
  }
}
function readCache(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch(e){ return null; } }
function writeCache(data){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch(e){} }
function merge(base, overlay){ const out = structuredClone(base); if(overlay.meta) out.meta = {...out.meta, ...overlay.meta}; ['giorni','cose_da_fare','alloggi','costi','auto_documenti','prenotazioni','link_utili','note'].forEach(k => { if(Array.isArray(overlay[k]) && overlay[k].length) out[k] = overlay[k]; }); return out; }
function jsonp(url, params={}, timeout=8000){ return new Promise((resolve,reject)=>{ const cb = `usa26_cb_${Date.now()}_${Math.random().toString(36).slice(2)}`; const u = new URL(url); Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v)); u.searchParams.set('callback', cb); const s = document.createElement('script'); const t = setTimeout(()=>{ cleanup(); reject(new Error('Timeout Apps Script')); }, timeout); function cleanup(){ clearTimeout(t); delete window[cb]; s.remove(); } window[cb] = (data)=>{ cleanup(); resolve(data); }; s.onerror = ()=>{ cleanup(); reject(new Error('Errore caricamento Apps Script')); }; s.src = u.toString(); document.body.appendChild(s); }); }
function setupLinks(){ const route = state?.meta?.['Route Google Maps'] || '#'; $('#mapsFullRoute').href = route; const sheet = CONFIG.GOOGLE_SHEET_URL || state?.meta?.['Google Sheet'] || ''; ['editSheetHero','editSheetLink'].forEach(id=>{ const a=$('#'+id); if(!a) return; a.href = sheet || '#edit'; if(!sheet){a.removeAttribute('target'); a.removeAttribute('rel');} }); }
async function copySheetLink(){ const status=$('#sheetLinkStatus'); const sheet=CONFIG.GOOGLE_SHEET_URL || state?.meta?.['Google Sheet'] || ''; if(!sheet){ status.textContent='Inserisci prima GOOGLE_SHEET_URL in config.js.'; return; } try{ await navigator.clipboard.writeText(sheet); status.textContent='Link Google Sheet copiato.'; }catch(e){ status.textContent='Copia non riuscita: copia manualmente da config.js.'; } }
function populateDayFilter(){ const sel=$('#dayFilter'); if(!sel) return; sel.innerHTML = '<option value="all">Tutti i giorni</option>' + (state.giorni||[]).map(d=>`<option value="${safe(d.Data)}">${safe(fmtDate(d.Data))} · ${safe(d['Arrivo'])}</option>`).join(''); sel.addEventListener('change', renderThings); }
function renderAll(){ renderStats(); renderOverview(); renderDays(); renderThings(); renderCosts(); renderBookings(); renderLodging(); renderDocs(); renderLinks(); renderNotes(); $('#backendStatus').textContent = backendConnected ? 'Dati caricati dal Google Sheet / Apps Script.' : 'Uso dati locali/sample. Configura Apps Script per leggere dal Google Sheet.'; }
function renderStats(){ $('#statTravelers').textContent = state.meta?.Persone || '3'; $('#statDays').textContent = (state.giorni||[]).length; const total = (state.giorni||[]).map(d=>d['Guida stimata']).filter(Boolean).length; $('#statDrive').textContent = `${total} tappe`; }
function renderOverview(){ $('#overviewHighlights').innerHTML = ['4-6 SF','6 Santa Barbara','7 LA','8 Las Vegas','9 Grand Canyon','10 Page','11 Zion','12 SLC'].map(x=>`<span class="pill">${x}</span>`).join(''); $('#timelineMini').innerHTML = (state.giorni||[]).map(d=>`<article class="timeline-item"><strong>${safe(fmtDate(d.Data))}</strong><span>${safe(d['Titolo giornata'])}</span><span>${safe(d.Partenza)} → ${safe(d.Arrivo)}</span></article>`).join(''); }
function renderDays(){ $('#daysList').innerHTML = (state.giorni||[]).map(d=>{ const media = mediaBlock(imageList(d, 'Immagini sfondo')); return `<article class="day-card day-card--with-media">${media}<div class="day-card__head"><p class="eyebrow">${safe(fmtDate(d.Data))}</p><h2>${safe(d['Titolo giornata'])}</h2></div><div class="day-card__body"><div class="meta-grid"><div class="meta-box"><span>Partenza</span><strong>${safe(d.Partenza)}</strong></div><div class="meta-box"><span>Arrivo</span><strong>${safe(d.Arrivo)}</strong></div><div class="meta-box"><span>Guida stimata</span><strong>${safe(d['Guida stimata'])}</strong></div><div class="meta-box"><span>Priorità</span><strong>${safe(d['Priorità del giorno'])}</strong></div></div><p><strong>Da vedere:</strong> ${safe(d['Da vedere'])}</p><p class="muted">${safe(d.Note)}</p><p>${link(d['Google Maps'],'Apri Google Maps')}</p></div></article>`; }).join(''); }
function priorityClass(p=''){ const s=p.toLowerCase(); if(s.includes('alta')) return 'tag--high'; if(s.includes('media')) return 'tag--medium'; if(s.includes('opzionale') || s.includes('bassa')) return 'tag--optional'; return ''; }
function renderThings(){ const filter=$('#dayFilter')?.value || 'all'; let rows=state.cose_da_fare||[]; if(filter !== 'all') rows = rows.filter(r=>r.Data === filter); $('#thingsList').innerHTML = rows.map(r=>{ const media = mediaBlock(imageList(r, 'Immagine sfondo')); return `<article class="info-card info-card--with-media">${media}<div class="info-card__content"><span class="tag ${priorityClass(r.Priorità)}">${safe(r.Priorità || r.Categoria)}</span><h3>${safe(r['Cosa fare'])}</h3><p><strong>${safe(fmtDate(r.Data))}</strong> · ${safe(r.Luogo)}</p><p class="muted">${safe(r.Note)}</p><p><strong>Costo:</strong> ${safe(r['Costo stimato USD'] || '—')}</p><div class="link-row">${link(r['Link utile'],'Biglietti / info')}</div></div></article>`; }).join('') || '<p class="muted">Nessuna voce.</p>'; }
function renderCosts(){ const rows=state.costi||[]; const rough = rows.reduce((sum,r)=>sum+moneyNum(r['Costo stimato USD']),0); $('#costSummary').innerHTML = `<div class="cost-item"><span>Voci inserite</span><strong>${rows.length}</strong></div><div class="cost-item"><span>Somma grezza prime cifre</span><strong>$${rough.toFixed(0)}+</strong></div><p class="muted">La somma è indicativa: alcune voci sono per persona, altre per gruppo.</p>`; $('#costTable').innerHTML = table(rows, ['Categoria','Voce','Costo stimato USD','Pagamento','Link utile','Note']); }
function renderBookings(){ $('#bookingsList').innerHTML = (state.prenotazioni||[]).map(r=>`<article class="info-card"><span class="tag ${priorityClass(r.Priorità)}">${safe(r.Priorità)}</span><h3>${safe(r['Cosa prenotare'])}</h3><p><strong>Quando:</strong> ${safe(r['Per quando'])}</p><p><strong>Stato:</strong> ${safe(r.Stato)}</p><p><strong>Costo:</strong> ${safe(r['Costo stimato USD'])}</p><p class="muted">${safe(r.Note)}</p><div class="link-row">${link(r['Link utile'],'Prenota / info')}</div></article>`).join(''); }
function renderLodging(){ $('#lodgingList').innerHTML = (state.alloggi||[]).map(r=>`<article class="info-card"><span class="tag">${safe(fmtDate(r['Data notte']))}</span><h3>${safe(r.Zona)}</h3><p><strong>${safe(r['Nome alloggio'])}</strong></p><p>${safe(r.Indirizzo)}</p><p><strong>Costo:</strong> ${safe(r['Costo stimato USD'] || 'Da inserire')}</p><p class="muted">${safe(r.Note)}</p><div class="link-row">${link(r['Link prenotazione'],'Prenotazione')}</div></article>`).join(''); }
function renderDocs(){ const rows=state.auto_documenti||[]; const auto=rows.filter(r=>r.Categoria.toLowerCase()==='auto'); const docs=rows.filter(r=>r.Categoria.toLowerCase()!=='auto'); $('#autoList').innerHTML = miniList(auto); $('#docsList').innerHTML = miniList(docs); }
function miniList(rows){ return rows.map(r=>`<div class="note"><strong>${safe(r.Voce)}</strong><p class="muted"><strong>${safe(r.Stato)}</strong> · ${safe(r.Note)}</p>${link(r['Link utile'],'Info')}</div>`).join(''); }
function renderLinks(){ $('#linksList').innerHTML = (state.link_utili||[]).map(r=>`<article class="info-card"><span class="tag">${safe(r.Categoria)}</span><h3>${safe(r.Nome)}</h3><p class="muted">${safe(r.Note)}</p><div class="link-row">${link(r.Link,'Apri')}</div></article>`).join(''); }
function renderNotes(){ $('#notesList').innerHTML = (state.note||[]).map(r=>`<div class="note"><strong>${safe(r.Tema)}</strong><p class="muted">${safe(r.Nota)}</p>${link(r['Link utile'],'Link')}</div>`).join(''); }
function table(rows, cols){ if(!rows.length) return '<p class="muted">Nessun dato.</p>'; return `<div class="table-wrap"><table class="simple-table"><thead><tr>${cols.map(c=>`<th>${safe(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${c.toLowerCase().includes('link') ? link(r[c],'Apri') : safe(r[c] || '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
function exportJson(){ download(`usa26-data-${Date.now()}.json`, JSON.stringify(state, null, 2), 'application/json'); }
function exportCsv(){ const rows=state.cose_da_fare||[]; const headers=['Data','Luogo','Cosa fare','Categoria','Priorità','Costo stimato USD','Link utile','Immagine sfondo','Fonte immagine','Note']; const csv=[headers.join(',')].concat(rows.map(r=>headers.map(h=>`"${String(r[h]||'').replace(/"/g,'""')}"`).join(','))).join('\n'); download(`usa26-cose-da-fare-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8'); }
function download(name, content, type){ const blob=new Blob([content],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); URL.revokeObjectURL(a.href); }
