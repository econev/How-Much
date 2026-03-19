/* ═══════════════════════════════════════════
   HOW MUCH? — Internationalization (i18n)
   Languages: RU, EN
   ═══════════════════════════════════════════ */

const TRANSLATIONS = {
  ru: {
    "hero.eyebrow":       "Сравнение цен · 2026",
    "hero.title1":        "Сколько это",
    "hero.title2":        "стоит?",
    "hero.sub":           "Реальные цены из магазинов вашего города — без рекламы и скрытых комиссий.",
    "search.placeholder": "iPhone 15, RTX 4070, Samsung QLED...",
    "cat.all":            "Все",
    "cat.smartphones":    "Смартфоны",
    "cat.components":     "Комплектующие",
    "cat.laptops":        "Ноутбуки",
    "cat.tvs":            "Телевизоры",
    "city.moscow":        "Москва",
    "city.spb":           "Санкт-Петербург",
    "city.almaty":        "Алматы",
    "city.astana":        "Астана",
    "city.minsk":         "Минск",
    "city.kyiv":          "Киев",
    "deals.label":        "Лучшие сделки сегодня",
    "deals.sub":          "Топ-3 скидки относительно средней цены за неделю",
    "results.label":      "Результаты поиска",
    "sort.price_asc":     "↑ Цена",
    "sort.price_desc":    "↓ Цена",
    "sort.discount":      "% Скидка",
    "catalog.label":      "Каталог",
    "catalog.loadmore":   "Показать ещё",
    "footer.note":        "Данные обновляются каждые 6 часов · Только для информации",
    "modal.stores":       "Магазины",
    "modal.price_history":"История цены",
    "modal.buy":          "Перейти в магазин",
    "modal.ai_prefix":    "AI прогноз:",
    "modal.currency":     "₽",
    "badge.deal":         "🔥 Скидка",
    "empty.title":        "Ничего не найдено",
    "empty.sub":          "Попробуйте другой запрос или категорию",
    "stores.best":        "Лучшая цена",
    "updated":            "Обновлено",
  },
  en: {
    "hero.eyebrow":       "Price Comparison · 2026",
    "hero.title1":        "How much",
    "hero.title2":        "does it cost?",
    "hero.sub":           "Real store prices in your city — no ads, no hidden fees.",
    "search.placeholder": "iPhone 15, RTX 4070, Samsung QLED...",
    "cat.all":            "All",
    "cat.smartphones":    "Smartphones",
    "cat.components":     "Components",
    "cat.laptops":        "Laptops",
    "cat.tvs":            "TVs",
    "city.moscow":        "Moscow",
    "city.spb":           "St. Petersburg",
    "city.almaty":        "Almaty",
    "city.astana":        "Astana",
    "city.minsk":         "Minsk",
    "city.kyiv":          "Kyiv",
    "deals.label":        "Best Deals Today",
    "deals.sub":          "Top-3 discounts vs. weekly average price",
    "results.label":      "Search Results",
    "sort.price_asc":     "↑ Price",
    "sort.price_desc":    "↓ Price",
    "sort.discount":      "% Discount",
    "catalog.label":      "Catalog",
    "catalog.loadmore":   "Load More",
    "footer.note":        "Prices updated every 6 hours · For reference only",
    "modal.stores":       "Stores",
    "modal.price_history":"Price History",
    "modal.buy":          "Go to store",
    "modal.ai_prefix":    "AI Forecast:",
    "modal.currency":     "₽",
    "badge.deal":         "🔥 Deal",
    "empty.title":        "Nothing found",
    "empty.sub":          "Try a different search or category",
    "stores.best":        "Best price",
    "updated":            "Updated",
  }
};

// ─── State ───────────────────────────────────────
let currentLang = localStorage.getItem('howmuch_lang') || 'ru';

// ─── Core translator ─────────────────────────────
function t(key) {
  return TRANSLATIONS[currentLang][key] || TRANSLATIONS['ru'][key] || key;
}

// ─── Apply all [data-i18n] attributes ────────────
function applyTranslations() {
  // Text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });

  // <option> tags
  document.querySelectorAll('[data-i18n-option]').forEach(el => {
    const key = el.getAttribute('data-i18n-option');
    el.textContent = t(key);
  });

  // Update html lang
  document.documentElement.setAttribute('lang', currentLang);

  // Update <title>
  document.title = currentLang === 'ru'
    ? 'How Much? — Сравнение цен'
    : 'How Much? — Price Comparison';

  // Update lang toggle active state
  document.querySelectorAll('.lang-opt').forEach(el => {
    el.classList.toggle('active', el.getAttribute('data-lang-label') === currentLang);
  });
}

// ─── Toggle handler ──────────────────────────────
function toggleLang() {
  currentLang = currentLang === 'ru' ? 'en' : 'ru';
  localStorage.setItem('howmuch_lang', currentLang);
  applyTranslations();
  // Re-render dynamic content
  if (window.renderApp) window.renderApp();
}

// ─── Init ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  document.getElementById('langToggle')?.addEventListener('click', toggleLang);
});
