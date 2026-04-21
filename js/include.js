// =============================================
//  MLSCABSERVICES – include.js
//  Dynamically loads header and footer
// =============================================

(function () {
  const PHONE   = '+917080125582';
  const WA_NUM  = '917080125582';
  const BUSINESS = 'MLSCABSERVICES';

  /* ---- Load a component HTML into a selector ---- */
  async function loadComponent(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      el.innerHTML = await resp.text();
      el.dispatchEvent(new Event('component-loaded'));
    } catch (e) {
      console.warn(`Could not load ${url}:`, e.message);
    }
  }

  /* ---- Highlight active nav link ---- */
  function setActiveNav() {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === page || (page === 'index.html' && href === 'index.html') ||
          (page === '' && href === 'index.html')) {
        a.classList.add('active');
      }
    });
  }

  /* ---- Mobile hamburger toggle ---- */
  function initHamburger() {
    const btn  = document.querySelector('.hamburger');
    const menu = document.querySelector('.nav-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', () => {
      btn.classList.toggle('open');
      menu.classList.toggle('open');
      document.body.classList.toggle('nav-open');
    });
    // Close on link click
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        btn.classList.remove('open');
        menu.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });
  }

  /* ---- After header loads ---- */
  document.querySelector('#site-header')?.addEventListener('component-loaded', () => {
    setActiveNav();
    initHamburger();
  });

  /* ---- Boot ---- */
  loadComponent('#site-header', 'components/header.html');
  loadComponent('#site-footer', 'components/footer.html');
})();
