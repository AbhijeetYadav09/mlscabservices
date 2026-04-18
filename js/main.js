// =============================================
//  MLSCABSERVICES – main.js
//  WhatsApp booking + Photon autocomplete
// =============================================

const PHONE  = '+917379164736';
const WA_NUM = '917379164736';

/* ============================================================
   WHATSAPP BOOKING
   ============================================================ */
function sendWhatsApp(pickupId, dropId) {
  const pickup = (document.getElementById(pickupId)?.value || '').trim();
  const drop   = (document.getElementById(dropId)?.value  || '').trim();
  const service = (document.getElementById('service-type')?.value || 'Outstation').trim();

  if (!pickup || !drop) {
    showToast('Please enter both Pickup and Drop locations.', 'warn');
    return;
  }

  const msg = `Hello MLSCABSERVICES,\nService: ${service}\nPickup: ${pickup}\nDrop: ${drop}\nPlease share fare details.`;
  const url  = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* Quick WA with prefilled pickup/drop text and optional service */
function sendWhatsAppRoute(pickup, drop, service = 'Outstation') {
  const msg = `Hello MLSCABSERVICES,\nService: ${service}\nPickup: ${pickup}\nDrop: ${drop}\nPlease share fare details.`;
  const url  = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ============================================================
   PHOTON AUTOCOMPLETE  (https://photon.komoot.io — no key)
   ============================================================ */
const cache = {};

async function photonSearch(query) {
  if (!query || query.length < 3) return [];
  if (cache[query]) return cache[query];

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en&bbox=70,18,90,32`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    const results = (data.features || []).map(f => {
      const p = f.properties;
      const parts = [p.name, p.city || p.town || p.village, p.state, p.country]
        .filter(Boolean);
      return [...new Set(parts)].join(', ');
    }).filter(Boolean);
    cache[query] = results;
    return results;
  } catch {
    return [];
  }
}

function initAutocomplete(inputId, dropdownId) {
  const input    = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  if (!input || !dropdown) return;

  let debounceTimer;

  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 3) { closeDropdown(dropdown); return; }

    debounceTimer = setTimeout(async () => {
      const suggestions = await photonSearch(q);
      renderDropdown(input, dropdown, suggestions);
    }, 300);
  });

  input.addEventListener('keydown', e => {
    const items = dropdown.querySelectorAll('.autocomplete-item');
    const active = dropdown.querySelector('.autocomplete-item.focused');
    let idx = [...items].indexOf(active);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idx = (idx + 1) % items.length;
      setFocus(items, idx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idx = (idx - 1 + items.length) % items.length;
      setFocus(items, idx);
    } else if (e.key === 'Enter' && active) {
      e.preventDefault();
      input.value = active.dataset.value;
      closeDropdown(dropdown);
    } else if (e.key === 'Escape') {
      closeDropdown(dropdown);
    }
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      closeDropdown(dropdown);
    }
  });
}

function renderDropdown(input, dropdown, items) {
  dropdown.innerHTML = '';
  if (!items.length) { closeDropdown(dropdown); return; }
  items.forEach(text => {
    const div = document.createElement('div');
    div.className = 'autocomplete-item';
    div.dataset.value = text;
    div.innerHTML = `<i class="fas fa-map-marker-alt"></i>${escapeHtml(text)}`;
    div.addEventListener('mousedown', e => e.preventDefault());
    div.addEventListener('click', () => {
      input.value = text;
      closeDropdown(dropdown);
      input.focus();
    });
    dropdown.appendChild(div);
  });
  dropdown.classList.add('active');
}

function closeDropdown(dropdown) {
  dropdown.classList.remove('active');
  dropdown.innerHTML = '';
}

function setFocus(items, idx) {
  items.forEach(i => i.classList.remove('focused'));
  if (items[idx]) {
    items[idx].classList.add('focused');
    items[idx].scrollIntoView({ block: 'nearest' });
  }
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

/* ============================================================
   TOAST NOTIFICATION
   ============================================================ */
function showToast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const colors = { info: '#1a1a2e', warn: '#d4881a', success: '#1ebe5d', error: '#e53e3e' };
  toast.style.cssText = `background:${colors[type] || colors.info};color:#fff;padding:14px 20px;border-radius:8px;font-size:0.92rem;max-width:300px;box-shadow:0 4px 16px rgba(0,0,0,0.2);animation:fadeInRight 0.3s ease;`;
  toast.textContent = msg;

  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = '@keyframes fadeInRight{from{opacity:0;transform:translateX(30px)}to{opacity:1;transform:translateX(0)}}';
    document.head.appendChild(s);
  }
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

/* ============================================================
   CONTACT FORM – mailto fallback
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name    = form.querySelector('#cf-name')?.value.trim()    || '';
    const phone   = form.querySelector('#cf-phone')?.value.trim()   || '';
    const subject = form.querySelector('#cf-subject')?.value.trim() || 'Inquiry';
    const message = form.querySelector('#cf-message')?.value.trim() || '';
    if (!name || !phone || !message) {
      showToast('Please fill all required fields.', 'warn');
      return;
    }
    const waMsg = `Hello MLSCABSERVICES,\nName: ${name}\nPhone: ${phone}\nSubject: ${subject}\n\n${message}`;
    window.open(`https://wa.me/${WA_NUM}?text=${encodeURIComponent(waMsg)}`, '_blank', 'noopener,noreferrer');
    form.reset();
    showToast('Message sent via WhatsApp!', 'success');
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initAutocomplete('pickup', 'pickup-dropdown');
  initAutocomplete('drop',   'drop-dropdown');
  initContactForm();
});
