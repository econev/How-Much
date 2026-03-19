/* ═══════════════════════════════════════════
   HOW MUCH? — Data Layer
   Структура: products[] + price history
   В продакшне заменить на fetch() из JSON-файлов
   ═══════════════════════════════════════════ */

const COUNTRY_CONFIG = {
  "Россия": { currency: "₽", rate: 1, stores: ['DNS', 'М.Видео', 'Ситилинк', 'Яндекс Маркет', 'Wildberries'] },
  "Казахстан": { currency: "₸", rate: 5.2, stores: ['Sulpak', 'Technodom', 'Mechta', 'Kaspi Shop', 'Alser'] },
  "Беларусь": { currency: "BYN", rate: 0.035, stores: ['5element', '21vek.by', 'Электросила', 'Ozon.by'] },
  "Украина": { currency: "₴", rate: 0.42, stores: ['Rozetka', 'Comfy', 'Allo', 'Citrus', 'Foxtrot'] },
  "Молдова": { currency: "MDL", rate: 0.2, stores: ['Darwin', 'Maximum', 'Bomba', 'Enter'] },
  "Узбекистан": { currency: "UZS", rate: 135, stores: ['Texnomart', 'Mediapark', 'Uzum Market', 'Olcha'] },
  "Германия": { currency: "€", rate: 0.01, stores: ['MediaMarkt', 'Saturn', 'Amazon.de', 'Otto'] },
  "США": { currency: "$", rate: 0.011, stores: ['Best Buy', 'Amazon', 'Walmart', 'B&H Photo Video'] }
};

let currentCountry = "Россия";

// ─── Helpers ─────────────────────────────────────
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

// ─── Price history generator ─────────────────────
function genHistory(base, days = 30) {
  const out = [];
  let p = base;
  for (let i = days; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    p = Math.max(base * 0.8, p + rnd(-base * 0.015, base * 0.012));
    out.push({ date: d.toISOString().slice(0,10), price: Math.round(p) });
  }
  return out;
}

// ─── Store generators ────────────────────────────
function makeStores(base, city, country, productName) {
  const config = COUNTRY_CONFIG[country] || COUNTRY_CONFIG["Россия"];
  const names = config.stores;
  const count = rnd(2, 4);
  const stores = [];
  for (let i = 0; i < count; i++) {
    const variance = 1 + (i * 0.03) + rnd(-3, 6) / 100;
    const storeName = names[i % names.length];
    const searchUrl = productName ? `https://www.google.com/search?q=${encodeURIComponent(productName + ' купить в ' + storeName)}` : '#';
    stores.push({
      name: storeName,
      price: Math.round(base * variance),
      url: searchUrl,
    });
  }
  return stores.sort((a, b) => a.price - b.price);
}

// ─── Raw product catalogue ───────────────────────
const RAW_PRODUCTS = [
  // Smartphones
  { id: 1,  cat: 'smartphones', name: 'Apple iPhone 15 Pro 256GB', basePrice: 89990,  avgWeekPrice: 97000,  ai: { trend: 'down', pct: 4, weeks: 3 } },
  { id: 2,  cat: 'smartphones', name: 'Samsung Galaxy S24 Ultra',   basePrice: 104990, avgWeekPrice: 108000, ai: { trend: 'stable', pct: 0, weeks: 0 } },
  { id: 3,  cat: 'smartphones', name: 'Google Pixel 8 Pro',         basePrice: 69990,  avgWeekPrice: 75000,  ai: { trend: 'down', pct: 6, weeks: 4 } },
  { id: 4,  cat: 'smartphones', name: 'Xiaomi 14 Ultra',            basePrice: 79990,  avgWeekPrice: 82000,  ai: { trend: 'down', pct: 2, weeks: 2 } },
  { id: 5,  cat: 'smartphones', name: 'OnePlus 12 256GB',           basePrice: 54990,  avgWeekPrice: 56000,  ai: { trend: 'stable', pct: 1, weeks: 1 } },
  // Components
  { id: 6,  cat: 'components',  name: 'NVIDIA GeForce RTX 4070 Ti', basePrice: 69990,  avgWeekPrice: 78000,  ai: { trend: 'down', pct: 8, weeks: 3 } },
  { id: 7,  cat: 'components',  name: 'AMD Ryzen 9 7950X',          basePrice: 39990,  avgWeekPrice: 42000,  ai: { trend: 'down', pct: 5, weeks: 2 } },
  { id: 8,  cat: 'components',  name: 'Samsung 990 Pro 2TB NVMe',   basePrice: 14990,  avgWeekPrice: 16500,  ai: { trend: 'down', pct: 9, weeks: 4 } },
  { id: 9,  cat: 'components',  name: 'Corsair DDR5-6000 32GB Kit', basePrice: 12990,  avgWeekPrice: 13500,  ai: { trend: 'stable', pct: 2, weeks: 1 } },
  { id: 10, cat: 'components',  name: 'ASUS ROG Maximus Z790 Hero', basePrice: 44990,  avgWeekPrice: 46000,  ai: { trend: 'up', pct: 3, weeks: 2 } },
  { id: 101, cat: 'components', name: 'SSD Kingston A400 240 ГБ',   basePrice: 2500,   avgWeekPrice: 2800,   ai: { trend: 'stable', pct: 0, weeks: 1 } },
  // Laptops
  { id: 11, cat: 'laptops',     name: 'Apple MacBook Pro M3 Pro',   basePrice: 179990, avgWeekPrice: 185000, ai: { trend: 'stable', pct: 1, weeks: 1 } },
  { id: 12, cat: 'laptops',     name: 'ASUS ROG Zephyrus G16',      basePrice: 139990, avgWeekPrice: 148000, ai: { trend: 'down', pct: 5, weeks: 3 } },
  { id: 13, cat: 'laptops',     name: 'Lenovo ThinkPad X1 Carbon',  basePrice: 109990, avgWeekPrice: 112000, ai: { trend: 'stable', pct: 2, weeks: 2 } },
  { id: 14, cat: 'laptops',     name: 'Dell XPS 15 OLED 2026',      basePrice: 129990, avgWeekPrice: 135000, ai: { trend: 'down', pct: 3, weeks: 2 } },
  // TVs
  { id: 15, cat: 'tvs',         name: 'Samsung Neo QLED 8K 75"',    basePrice: 219990, avgWeekPrice: 235000, ai: { trend: 'down', pct: 7, weeks: 5 } },
  { id: 16, cat: 'tvs',         name: 'LG OLED C3 65"',             basePrice: 99990,  avgWeekPrice: 105000, ai: { trend: 'down', pct: 5, weeks: 3 } },
  { id: 17, cat: 'tvs',         name: 'Sony Bravia XR A95L 55"',    basePrice: 119990, avgWeekPrice: 125000, ai: { trend: 'stable', pct: 1, weeks: 1 } },
  { id: 18, cat: 'tvs',         name: 'Hisense U8K Mini LED 65"',   basePrice: 69990,  avgWeekPrice: 77000,  ai: { trend: 'down', pct: 9, weeks: 4 } },
];

// ─── Build product DB ─────────────────────────────
function buildProducts(city, country) {
  const config = COUNTRY_CONFIG[country] || COUNTRY_CONFIG["Россия"];
  return RAW_PRODUCTS.map(p => {
    const localBasePrice = Math.round(p.basePrice * config.rate);
    const localAvgWeekPrice = Math.round(p.avgWeekPrice * config.rate);
    const stores = makeStores(localBasePrice, city, country, p.name);
    const minPrice = stores[0].price;
    const discount = Math.round((1 - minPrice / localAvgWeekPrice) * 100);
    return {
      ...p,
      stores,
      minPrice,
      maxPrice: stores[stores.length - 1].price,
      avgWeekPrice: localAvgWeekPrice,
      discount: Math.max(0, discount),
      history: genHistory(localBasePrice),
    };
  });
}

// ─── Current city state ───────────────────────────
let PRODUCTS = buildProducts('', 'Россия');

function setCity(city, country) {
  currentCountry = country;
  PRODUCTS = buildProducts(city, country);
}

// ─── Get best deals (top discount) ───────────────
function getBestDeals(n = 3) {
  return [...PRODUCTS].sort((a, b) => b.discount - a.discount).slice(0, n);
}

// ─── Search ────────────────────────────────────────
function searchProducts(query, cat) {
  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(Boolean);
  return PRODUCTS.filter(p => {
    const matchCat = !cat || cat === 'all' || p.cat === cat;
    const nameLower = p.name.toLowerCase();
    const matchQ = words.length === 0 || words.every(w => nameLower.includes(w));
    return matchCat && matchQ;
  });
}

// ─── Sort ──────────────────────────────────────────
function sortProducts(arr, mode) {
  const copy = [...arr];
  if (mode === 'price_asc')  return copy.sort((a,b) => a.minPrice - b.minPrice);
  if (mode === 'price_desc') return copy.sort((a,b) => b.minPrice - a.minPrice);
  if (mode === 'discount')   return copy.sort((a,b) => b.discount - a.discount);
  return copy;
}

// ─── Format price ──────────────────────────────────
function fmtPrice(num) {
  const config = COUNTRY_CONFIG[currentCountry] || COUNTRY_CONFIG["Россия"];
  return num.toLocaleString('ru-RU') + ' ' + config.currency;
}

// ─── Category label ────────────────────────────────
const CAT_LABELS = {
  ru: { smartphones:'Смартфоны', components:'Комплектующие', laptops:'Ноутбуки', tvs:'Телевизоры' },
  en: { smartphones:'Smartphones', components:'Components', laptops:'Laptops', tvs:'TVs' },
};

function catLabel(cat) {
  return (CAT_LABELS[currentLang] || CAT_LABELS.ru)[cat] || cat;
}
