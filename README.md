# How Much? 💰
**Сравнение цен на технику · Price Comparison for Electronics**

Статичный сайт на GitHub Pages с автообновлением цен через GitHub Actions.

---

## 🚀 Быстрый старт (Deploy to GitHub Pages)

### 1. Создай репозиторий
```bash
git init
git add .
git commit -m "init: How Much? price comparison site"
git remote add origin https://github.com/YOUR_USERNAME/how-much.git
git push -u origin main
```

### 2. Включи GitHub Pages
- Открой **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: `main` / `/ (root)`
- Сохрани → сайт будет на `https://YOUR_USERNAME.github.io/how-much/`

### 3. Автообновление цен
GitHub Actions автоматически запускает скрипт каждые 6 часов.
Убедись, что в репозитории разрешены Actions:
- **Settings → Actions → General → Allow all actions**

---

## 📁 Структура проекта

```
how-much/
├── index.html              # Главная страница
├── manifest.json           # PWA манифест
├── css/
│   └── style.css           # Стили (Liquid Glass Design)
├── js/
│   ├── i18n.js             # Переводы RU/EN
│   ├── data.js             # Данные и логика
│   └── app.js              # UI логика
├── scripts/
│   └── scrape.py           # Скрипт парсинга цен
├── data/                   # JSON файлы с ценами (авто)
│   ├── prices_moscow.json
│   ├── prices_spb.json
│   └── ...
├── icons/                  # PWA иконки (добавь сам)
│   ├── icon-192.png
│   └── icon-512.png
└── .github/
    └── workflows/
        └── update-prices.yml  # GitHub Actions
```

---

## 🔧 Настройка реального парсинга

Открой `scripts/scrape.py` и добавь реальные источники данных:

```python
def scrape_real_prices(city: str) -> list:
    # Пример для DNS:
    headers = {'User-Agent': 'Mozilla/5.0 ...'}
    r = requests.get(f"https://www.dns-shop.ru/search/?q=iphone+15", headers=headers)
    soup = BeautifulSoup(r.text, 'lxml')
    # Парсинг цен...
```

**Рекомендуемые источники:**
| Город | Магазины |
|-------|---------|
| Москва / СПб | DNS, М.Видео, Ситилинк |
| Алматы / Астана | Kaspi Shop, Technodom, Sulpak |
| Минск | 5element, 21vek |
| Киев | Rozetka, Comfy |

---

## 🌍 Языки

Переключатель RU/EN в правом верхнем углу.
Добавить новый язык — добавь объект в `js/i18n.js`:

```js
const TRANSLATIONS = {
  ru: { ... },
  en: { ... },
  kz: { ... },  // Новый язык
}
```

---

## 📱 PWA (Progressive Web App)

Сайт можно установить на телефон как приложение.
Добавь иконки `icon-192.png` и `icon-512.png` в папку `icons/`.

---

## ⚡ Технологии

- **Frontend**: Vanilla JS + Chart.js
- **Design**: Liquid Glass (CSS backdrop-filter)
- **Fonts**: Syne + DM Sans (Google Fonts)
- **Deploy**: GitHub Pages (бесплатно)
- **Data**: GitHub Actions + Python scraper → JSON

---

## 📄 Лицензия

MIT — используй свободно.
