// =============================================
//  MLSCABSERVICES – main.js
// =============================================

const PHONE  = '+917080125582';
const WA_NUM = '917080125582';

/* ============================================================
   TIME WARNING MODAL
   ============================================================ */
function openTimeModal(msg) {
  const modal = document.getElementById('time-modal');
  if (!modal) return;
  const msgEl = document.getElementById('tm-msg');
  if (msgEl && msg) msgEl.textContent = msg;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeTimeModal() {
  const modal = document.getElementById('time-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('click', function(e) {
  var modal = document.getElementById('time-modal');
  if (modal && e.target === modal) closeTimeModal();
});
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeTimeModal();
});

function isTimeValid(dateVal, timeVal) {
  if (!dateVal || !timeVal) return true;
  var pickup = new Date(dateVal + 'T' + timeVal);
  var twoHrsLater = new Date(Date.now() + 2 * 60 * 60 * 1000);
  return pickup >= twoHrsLater;
}

/* ============================================================
   BOOKING CARD — TAB SWITCHING
   ============================================================ */
function initBookingTabs() {
  var tabs = document.querySelectorAll('.bk-tab');
  if (!tabs.length) return;
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      document.querySelectorAll('.bk-panel').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
}

/* ============================================================
   BOOKING CARD — ONE-WAY / ROUNDTRIP TOGGLE
   ============================================================ */
function initTripToggle() {
  document.querySelectorAll('.bk-tog').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var group = btn.closest('.bk-toggle');
      group.querySelectorAll('.bk-tog').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var isRT = btn.dataset.trip === 'Round Trip';
      var returnRow = document.getElementById('os-return-row');
      var mobileRow = document.getElementById('os-mobile-row');
      if (returnRow) returnRow.style.display = isRT ? 'grid' : 'none';
      if (mobileRow) mobileRow.style.display = isRT ? 'none' : 'flex';
    });
  });
}

/* ============================================================
   MULTI-CITY: Add / Remove extra drop cities
   ============================================================ */
var cityCount = 1;

function addMoreCity() {
  var wrap = document.getElementById('os-cities-wrap');
  if (!wrap) return;
  if (cityCount >= 5) { showToast('Maximum 5 cities allowed.', 'warn'); return; }
  var idx  = cityCount;
  var uid  = 'os-city-' + idx;
  var ddId = 'os-city-dd-' + idx;
  var div  = document.createElement('div');
  div.className = 'bk-field mc-city-field';
  div.dataset.index = idx;
  div.style.position = 'relative';
  div.innerHTML =
    '<i class="fas fa-map-marker-alt bk-icon red"></i>' +
    '<input type="text" id="' + uid + '" placeholder="Via City ' + (idx + 1) + '" autocomplete="off" />' +
    '<div id="' + ddId + '" class="autocomplete-dropdown" role="listbox"></div>' +
    '<button type="button" class="mc-remove-btn" onclick="removeCity(this)" aria-label="Remove city">' +
      '<i class="fas fa-times-circle"></i>' +
    '</button>';
  wrap.appendChild(div);
  cityCount++;
  initAutocomplete(uid, ddId);
  var inp = document.getElementById(uid);
  if (inp) inp.focus();
}

function removeCity(btn) {
  var field = btn.closest('.mc-city-field');
  if (field) { field.remove(); cityCount--; }
}

/* ============================================================
   BOOKING CARD — SUBMIT
   ============================================================ */
function bookingSubmit(tab) {
  var msg   = '';
  var valid = true;

  function val(id, optional) {
    var el = document.getElementById(id);
    var v  = el ? (el.value || '').trim() : '';
    if (!v && !optional) {
      var field = el ? el.closest('.bk-field') : null;
      if (field) {
        field.classList.add('error');
        setTimeout(function() { field.classList.remove('error'); }, 800);
      }
      valid = false;
    }
    return v;
  }

  if (tab === 'outstation') {
    var activeToggle = document.querySelector('#panel-outstation .bk-tog.active');
    var isRT    = activeToggle ? activeToggle.dataset.trip === 'Round Trip' : false;
    var trip    = isRT ? 'Round Trip' : 'One Way';
    var pickup  = val('os-pickup');
    var drop    = val('os-drop');
    var date    = val('os-date');
    var time    = val('os-time');
    var mobile  = isRT ? val('os-mobile-rt') : val('os-mobile');
    var returnDt = isRT ? val('os-return-date') : '';

    var extraCities = [];
    document.querySelectorAll('#os-cities-wrap .mc-city-field[data-index]').forEach(function(f) {
      if (f.dataset.index === '0') return;
      var inp = f.querySelector('input');
      if (inp && inp.value.trim()) extraCities.push(inp.value.trim());
    });

    if (!valid) { showToast('Please fill all required fields.', 'warn'); return; }

    if (!isTimeValid(date, time)) {
      openTimeModal('PickupTime should be greater than 2 hours from current time!');
      return;
    }

    var viaLine    = extraCities.length ? '\nVia: ' + extraCities.join(' \u2192 ') : '';
    var returnLine = isRT ? '\nReturn Date: ' + returnDt : '';
    msg = 'Hello MLSCABSERVICES,\nService: Outstation (' + trip + ')\nPickup: ' + pickup + '\nDrop: ' + drop + viaLine + '\nDate: ' + date + '\nTime: ' + time + returnLine + '\nMobile: ' + mobile + '\nPlease share fare details.';

  } else if (tab === 'local') {
    var city   = val('lc-city');
    var pkg    = val('lc-package');
    var ldate  = val('lc-date');
    var ltime  = val('lc-time');
    var lmob   = val('lc-mobile');
    if (!valid) { showToast('Please fill all required fields.', 'warn'); return; }
    if (!isTimeValid(ldate, ltime)) { openTimeModal('PickupTime should be greater than 2 hours from current time!'); return; }
    msg = 'Hello MLSCABSERVICES,\nService: Local Cab\nCity: ' + city + '\nPackage: ' + pkg + '\nDate: ' + ldate + '\nTime: ' + ltime + '\nMobile: ' + lmob + '\nPlease share fare details.';

  } else if (tab === 'airport') {
    var airport   = val('ap-airport');
    var direction = val('ap-direction');
    var address   = val('ap-address');
    var adate     = val('ap-date');
    var atime     = val('ap-time');
    var amob      = val('ap-mobile');
    if (!valid) { showToast('Please fill all required fields.', 'warn'); return; }
    if (!isTimeValid(adate, atime)) { openTimeModal('PickupTime should be greater than 2 hours from current time!'); return; }
    msg = 'Hello MLSCABSERVICES,\nService: Airport Transfer\nAirport: ' + airport + '\nDirection: ' + direction + '\nAddress: ' + address + '\nDate: ' + adate + '\nTime: ' + atime + '\nMobile: ' + amob + '\nPlease share fare details.';
  }

  if (msg) {
    window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
  }
}

/* ============================================================
   LEGACY HELPERS (routes page etc.)
   ============================================================ */
function sendWhatsApp(pickupId, dropId, serviceId) {
  var pickup  = (document.getElementById(pickupId)  ? document.getElementById(pickupId).value  : '').trim();
  var drop    = (document.getElementById(dropId)    ? document.getElementById(dropId).value    : '').trim();
  var service = (document.getElementById(serviceId) ? document.getElementById(serviceId).value : 'Cab').trim();
  if (!pickup || !drop) { showToast('Please enter both Pickup and Drop locations.', 'warn'); return; }
  var msg = 'Hello MLSCABSERVICES,\nService: ' + service + '\nPickup: ' + pickup + '\nDrop: ' + drop + '\nPlease share fare details.';
  window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
}

function sendWhatsAppRoute(pickup, drop) {
  var msg = 'Hello MLSCABSERVICES,\nPickup: ' + pickup + '\nDrop: ' + drop + '\nPlease share fare details.';
  window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
}

function selectService(btn) {
  document.querySelectorAll('.service-tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var hidden = document.getElementById('service-type');
  if (hidden) hidden.value = btn.dataset.service;
}

/* ============================================================
   PHOTON AUTOCOMPLETE
   ============================================================ */
var cache = {};

async function photonSearch(query) {
  if (!query || query.length < 3) return [];
  if (cache[query]) return cache[query];
  var url = 'https://photon.komoot.io/api/?q=' + encodeURIComponent(query) + '&limit=6&lang=en&bbox=70,18,90,32';
  try {
    var resp = await fetch(url);
    var data = await resp.json();
    var results = (data.features || []).map(function(f) {
      var p = f.properties;
      var parts = [p.name, p.city || p.town || p.village, p.state, p.country].filter(Boolean);
      return Array.from(new Set(parts)).join(', ');
    }).filter(Boolean);
    cache[query] = results;
    return results;
  } catch(e) { return []; }
}

function initAutocomplete(inputId, dropdownId) {
  var input    = document.getElementById(inputId);
  var dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;
  var debounceTimer;

  input.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    var q = input.value.trim();
    if (q.length < 3) { closeDropdown(dropdown); return; }
    debounceTimer = setTimeout(async function() {
      renderDropdown(input, dropdown, await photonSearch(q));
    }, 300);
  });

  input.addEventListener('keydown', function(e) {
    var items  = dropdown.querySelectorAll('.autocomplete-item');
    var active = dropdown.querySelector('.autocomplete-item.focused');
    var idx    = Array.prototype.indexOf.call(items, active);
    if (e.key === 'ArrowDown')  { e.preventDefault(); setFocus(items, (idx + 1) % items.length); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setFocus(items, (idx - 1 + items.length) % items.length); }
    else if (e.key === 'Enter' && active) { e.preventDefault(); input.value = active.dataset.value; closeDropdown(dropdown); }
    else if (e.key === 'Escape') { closeDropdown(dropdown); }
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) closeDropdown(dropdown);
  });
}

function renderDropdown(input, dropdown, items) {
  dropdown.innerHTML = '';
  if (!items.length) { closeDropdown(dropdown); return; }
  items.forEach(function(text) {
    var div = document.createElement('div');
    div.className = 'autocomplete-item';
    div.dataset.value = text;
    div.innerHTML = '<i class="fas fa-map-marker-alt"></i>' + escapeHtml(text);
    div.addEventListener('mousedown', function(e) { e.preventDefault(); });
    div.addEventListener('click', function() { input.value = text; closeDropdown(dropdown); input.focus(); });
    dropdown.appendChild(div);
  });
  dropdown.classList.add('active');
}

function closeDropdown(d) { d.classList.remove('active'); d.innerHTML = ''; }

function setFocus(items, idx) {
  items.forEach(function(i) { i.classList.remove('focused'); });
  if (items[idx]) { items[idx].classList.add('focused'); items[idx].scrollIntoView({ block: 'nearest' }); }
}

function escapeHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

/* ============================================================
   TOAST
   ============================================================ */
function showToast(msg, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  var toast  = document.createElement('div');
  var colors = { info: '#1a1a2e', warn: '#d4881a', success: '#1ebe5d', error: '#e53e3e' };
  toast.style.cssText = 'background:' + (colors[type] || colors.info) + ';color:#fff;padding:14px 20px;border-radius:8px;font-size:0.92rem;max-width:300px;box-shadow:0 4px 16px rgba(0,0,0,0.2);';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(function() { toast.remove(); }, 3500);
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var name    = (form.querySelector('#cf-name')    ? form.querySelector('#cf-name').value.trim()    : '');
    var phone   = (form.querySelector('#cf-phone')   ? form.querySelector('#cf-phone').value.trim()   : '');
    var subject = (form.querySelector('#cf-subject') ? form.querySelector('#cf-subject').value.trim() : 'Inquiry');
    var message = (form.querySelector('#cf-message') ? form.querySelector('#cf-message').value.trim() : '');
    if (!name || !phone || !message) { showToast('Please fill all required fields.', 'warn'); return; }
    var waMsg = 'Hello MLSCABSERVICES,\nName: ' + name + '\nPhone: ' + phone + '\nSubject: ' + subject + '\n\n' + message;
    window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(waMsg), '_blank', 'noopener,noreferrer');
    form.reset();
    showToast('Message sent via WhatsApp!', 'success');
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', function() {
  initBookingTabs();
  initTripToggle();

  initAutocomplete('os-pickup',  'os-pickup-dd');
  initAutocomplete('os-drop',    'os-drop-dd');
  initAutocomplete('lc-city',    'lc-city-dd');
  initAutocomplete('ap-address', 'ap-address-dd');

  initContactForm();

  var today = new Date().toISOString().split('T')[0];
  document.querySelectorAll('input[type="date"]').forEach(function(d) { d.min = today; });
});
