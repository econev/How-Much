/* ═══════════════════════════════════════════
   HOW MUCH? — App Logic
   ═══════════════════════════════════════════ */

// ─── State ────────────────────────────────────────
let state = {
  query:    '',
  cat:      'all',
  sort:     'price_asc',
  city:     '',
  country:  '',
  page:     1,
  pageSize: 6,
};

let charts = {};

// ─── DOM refs ─────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── Card Templates ───────────────────────────────

function renderProductCard(p, isDeal = false) {
  const disc = p.discount > 0
    ? `<span class="price-drop">−${p.discount}%</span>` : '';
  const wasPrice = p.discount > 0
    ? `<span class="price-was">${fmtPrice(p.avgWeekPrice)}</span>` : '';

  const storeChips = p.stores.slice(0,3).map((s, i) =>
    `<span class="store-pill">
      ${s.name} <span class="store-pill-price">${fmtPrice(s.price)}</span>
    </span>`
  ).join('');

  const badge = isDeal
    ? `<span class="card-badge badge-deal">${t('badge.deal')} −${p.discount}%</span>`
    : `<span class="card-badge badge-cat">${catLabel(p.cat)}</span>`;

  return `
    <div class="product-card" data-id="${p.id}" role="button" tabindex="0" aria-label="${p.name}">
      <div class="card-top">${badge}</div>
      <div class="card-title">${p.name}</div>
      <div class="card-prices">
        <span class="price-min">${fmtPrice(p.minPrice)}</span>
        ${wasPrice}
        ${disc}
      </div>
      <div class="card-stores">${storeChips}</div>
    </div>
  `;
}

// ─── Deals section ────────────────────────────────
function renderDeals() {
  const grid = $('dealsGrid');
  if (!grid) return;
  const deals = getBestDeals(3);
  grid.innerHTML = deals.map(p => renderProductCard(p, true)).join('');
  attachCardListeners(grid);
}

// ─── Catalog section ──────────────────────────────
function renderCatalog() {
  const grid = $('catalogGrid');
  if (!grid) return;
  const all = searchProducts('', state.cat);
  const sorted = sortProducts(all, state.sort);
  const slice = sorted.slice(0, state.page * state.pageSize);
  grid.innerHTML = slice.map((p, i) => {
    const el = renderProductCard(p);
    // stagger animation
    return el.replace('product-card"', `product-card" style="animation-delay:${i * 0.04}s"`);
  }).join('');

  const btn = $('loadMoreBtn');
  if (btn) btn.style.display = slice.length >= sorted.length ? 'none' : 'inline-flex';
  attachCardListeners(grid);
}

// ─── Search results ───────────────────────────────
function renderResults() {
  const section = $('resultsSection');
  const grid    = $('resultsGrid');
  const catalog = $('catalogSection');
  if (!section || !grid) return;

  if (!state.query) {
    section.style.display = 'none';
    if (catalog) catalog.style.display = '';
    return;
  }

  section.style.display = '';
  if (catalog) catalog.style.display = 'none';

  const found = sortProducts(searchProducts(state.query, state.cat), state.sort);
  if (!found.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <div class="empty-text"><strong>${t('empty.title')}</strong></div>
        <div class="empty-text" style="opacity:.5">${t('empty.sub')}</div>
      </div>`;
    return;
  }

  grid.innerHTML = found.map((p, i) =>
    renderProductCard(p).replace('product-card"', `product-card" style="animation-delay:${i * 0.04}s"`)
  ).join('');
  attachCardListeners(grid);
}

// ─── Modal ───────────────────────────────────────
function openModal(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  const overlay = $('modalOverlay');
  const inner   = $('modalInner');
  if (!overlay || !inner) return;

  // AI insight text
  let aiText = '';
  const ai = p.ai;
  if (ai.trend === 'down') {
    aiText = currentLang === 'ru'
      ? `Цена падает ~${ai.pct}% в месяц. Подождите ${ai.weeks} нед., чтобы сэкономить ≈${fmtPrice(Math.round(p.minPrice * ai.pct * ai.weeks / 400))}.`
      : `Price dropping ~${ai.pct}% per month. Wait ${ai.weeks} wk. to save ≈${fmtPrice(Math.round(p.minPrice * ai.pct * ai.weeks / 400))}.`;
  } else if (ai.trend === 'up') {
    aiText = currentLang === 'ru'
      ? `Цена растёт. Лучше купить сейчас.`
      : `Price is rising. Better to buy now.`;
  } else {
    aiText = currentLang === 'ru'
      ? `Цена стабильна последние ${ai.weeks || 2} нед. Хорошее время для покупки.`
      : `Price has been stable for ${ai.weeks || 2} wk. Good time to buy.`;
  }

  // Stores list
  const storesList = p.stores.map((s, i) => `
    <a href="${s.url}" class="store-item${i === 0 ? ' store-best' : ''}" target="_blank" rel="noopener">
      <span class="store-name">${s.name}${i === 0 ? ` <small style="color:var(--text-3);font-size:11px">(${t('stores.best')})</small>` : ''}</span>
      <span class="store-price">${fmtPrice(s.price)}</span>
    </a>
  `).join('');

  inner.innerHTML = `
    <div class="modal-handle"></div>
    <div class="modal-title">${p.name}</div>
    <div class="modal-prices">
      <span class="modal-price-min">${fmtPrice(p.minPrice)}</span>
      ${p.discount > 0 ? `
        <span class="price-was">${fmtPrice(p.avgWeekPrice)}</span>
        <span class="price-drop">−${p.discount}%</span>
      ` : ''}
    </div>

    <div class="ai-insight">
      <div class="ai-icon">✦</div>
      <div class="ai-text"><strong>${t('modal.ai_prefix')}</strong> ${aiText}</div>
    </div>

    <div class="modal-section-label">${t('modal.stores')}</div>
    <div class="stores-list">${storesList}</div>

    <div class="modal-section-label">${t('modal.price_history')}</div>
    <div class="chart-wrap">
      <canvas id="priceChart"></canvas>
    </div>
  `;

  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Draw chart
  requestAnimationFrame(() => drawChart(p.history));
}

function closeModal() {
  const overlay = $('modalOverlay');
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // Destroy chart
  if (charts.price) { charts.price.destroy(); delete charts.price; }
}

function drawChart(history) {
  const canvas = document.getElementById('priceChart');
  if (!canvas) return;
  if (charts.price) charts.price.destroy();

  const labels = history.map(h => h.date.slice(5)); // MM-DD
  const data   = history.map(h => h.price);

  charts.price = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: '#c8ff00',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#c8ff00',
        fill: true,
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 120);
          g.addColorStop(0, 'rgba(200,255,0,0.15)');
          g.addColorStop(1, 'rgba(200,255,0,0)');
          return g;
        },
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: {
        callbacks: {
          label: ctx => fmtPrice(ctx.parsed.y),
        },
        backgroundColor: '#1a1a1a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#c8ff00',
        padding: 10,
      }},
      scales: {
        x: {
          ticks: { color: 'rgba(240,237,232,0.28)', font: { size: 10 }, maxTicksLimit: 6 },
          grid: { color: 'rgba(255,255,255,0.04)' },
          border: { color: 'transparent' },
        },
        y: {
          ticks: {
            color: 'rgba(240,237,232,0.28)',
            font: { size: 10 },
            callback: v => {
              const c = (typeof COUNTRY_CONFIG !== 'undefined') 
                ? (COUNTRY_CONFIG[currentCountry] || COUNTRY_CONFIG["Россия"]).currency 
                : '₽';
              return (v/1000).toFixed(0) + 'k ' + c;
            },
            maxTicksLimit: 4,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
          border: { color: 'transparent' },
        },
      },
    },
  });
}

// ─── Attach card listeners ────────────────────────
function attachCardListeners(container) {
  container.querySelectorAll('[data-id]').forEach(el => {
    const handler = () => openModal(+el.dataset.id);
    el.addEventListener('click', handler);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });
}

// ─── Full re-render ───────────────────────────────
function renderApp() {
  const dealsSec = document.querySelector('.deals-section');
  const catalogSec = $('catalogSection');
  const resultsSec = $('resultsSection');

  if (!state.city) {
    if (dealsSec) dealsSec.style.display = 'none';
    if (catalogSec) catalogSec.style.display = 'none';
    if (resultsSec) resultsSec.style.display = 'none';
    return;
  }

  if (dealsSec) dealsSec.style.display = '';

  renderDeals();
  renderCatalog();
  renderResults();
}

// ─── Event wiring ─────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Search input
  let searchTimer;
  $('searchInput')?.addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = e.target.value.trim();
      state.page = 1;
      renderResults();
    }, 280);
  });

  // Static Countries & Cities
  const LOCATION_DATA = [
    { country: "Россия", cities: ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань"] },
    { country: "Казахстан", cities: ["Алматы", "Астана", "Шымкент", "Караганда"] },
    { country: "Беларусь", cities: ["Минск", "Гомель", "Брест", "Витебск"] },
    { country: "Украина", cities: ["Киев", "Львов", "Одесса", "Харьков"] },
    { country: "Молдова", cities: ["Кишинёв", "Бельцы", "Тирасполь", "Бендеры"] },
    { country: "Узбекистан", cities: ["Ташкент", "Самарканд", "Бухара"] },
    { country: "Германия", cities: ["Берлин", "Мюнхен", "Гамбург", "Кёльн"] },
    { country: "США", cities: ["Нью-Йорк", "Лос-Анджелес", "Чикаго", "Майами"] }
  ];

  const countrySelect = $('countrySelect');
  if (countrySelect) {
    let opts = `<option value="">Страна...</option>`;
    LOCATION_DATA.forEach(c => {
      opts += `<option value="${c.country}">${c.country}</option>`;
    });
    countrySelect.innerHTML = opts;
  }

  $('countrySelect')?.addEventListener('change', e => {
    const selected = e.target.value;
    state.country = selected;
    state.city = ''; // reset city
    const country = LOCATION_DATA.find(c => c.country === selected);
    const citySelect = $('citySelect');
    if (citySelect) {
      if (country) {
        let opts = `<option value="">Город...</option>`;
        country.cities.forEach(city => {
          opts += `<option value="${city}">${city}</option>`;
        });
        citySelect.innerHTML = opts;
      } else {
        citySelect.innerHTML = `<option value="">Город...</option>`;
      }
    }
    renderApp();
  });

  // City select
  $('citySelect')?.addEventListener('change', e => {
    state.city = e.target.value;
    if (state.city) {
      setCity(state.city, state.country);
    }
    renderApp();
  });

  // Category chips
  document.querySelectorAll('.chip[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.cat = btn.dataset.cat;
      state.page = 1;
      document.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderApp();
    });
  });

  // Sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.sort = btn.dataset.sort;
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderApp();
    });
  });

  // Load more
  $('loadMoreBtn')?.addEventListener('click', () => {
    state.page++;
    renderCatalog();
  });

  // Modal close
  $('modalClose')?.addEventListener('click', closeModal);
  $('modalOverlay')?.addEventListener('click', e => {
    if (e.target === $('modalOverlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Touch swipe down to close modal
  let touchStartY = 0;
  $('productModal')?.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  $('productModal')?.addEventListener('touchend', e => {
    if (e.changedTouches[0].clientY - touchStartY > 80) closeModal();
  }, { passive: true });

  // Initial render
  renderApp();
});

// Expose for i18n re-render
window.renderApp = renderApp;
