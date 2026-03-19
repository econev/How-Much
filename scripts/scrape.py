#!/usr/bin/env python3
"""
HOW MUCH? — Price Scraper
Запускается GitHub Actions каждые 6 часов.
Сохраняет данные в data/prices_{city}.json

Для старта используется DNS (dns.ru) как пример.
Добавьте свои источники по аналогии.
"""

import json
import os
import time
import random
from datetime import datetime, timezone
from pathlib import Path

# Попытка импорта requests/BS4
try:
    import requests
    from bs4 import BeautifulSoup
    SCRAPING_AVAILABLE = True
except ImportError:
    SCRAPING_AVAILABLE = False
    print("⚠️  requests/beautifulsoup4 not installed — generating mock data")

# ─── Config ──────────────────────────────────────
DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)

CITIES = os.environ.get("CITY_LIST", "moscow").split(",")

PRODUCTS_TEMPLATE = [
    {"id": 1,  "cat": "smartphones", "name": "Apple iPhone 15 Pro 256GB"},
    {"id": 2,  "cat": "smartphones", "name": "Samsung Galaxy S24 Ultra"},
    {"id": 3,  "cat": "smartphones", "name": "Google Pixel 8 Pro"},
    {"id": 4,  "cat": "smartphones", "name": "Xiaomi 14 Ultra"},
    {"id": 5,  "cat": "smartphones", "name": "OnePlus 12 256GB"},
    {"id": 6,  "cat": "components",  "name": "NVIDIA GeForce RTX 4070 Ti"},
    {"id": 7,  "cat": "components",  "name": "AMD Ryzen 9 7950X"},
    {"id": 8,  "cat": "components",  "name": "Samsung 990 Pro 2TB NVMe"},
    {"id": 9,  "cat": "components",  "name": "Corsair DDR5-6000 32GB Kit"},
    {"id": 10, "cat": "components",  "name": "ASUS ROG Maximus Z790 Hero"},
    {"id": 11, "cat": "laptops",     "name": "Apple MacBook Pro M3 Pro"},
    {"id": 12, "cat": "laptops",     "name": "ASUS ROG Zephyrus G16"},
    {"id": 13, "cat": "laptops",     "name": "Lenovo ThinkPad X1 Carbon"},
    {"id": 14, "cat": "laptops",     "name": "Dell XPS 15 OLED 2026"},
    {"id": 15, "cat": "tvs",         "name": "Samsung Neo QLED 8K 75\""},
    {"id": 16, "cat": "tvs",         "name": "LG OLED C3 65\""},
    {"id": 17, "cat": "tvs",         "name": "Sony Bravia XR A95L 55\""},
    {"id": 18, "cat": "tvs",         "name": "Hisense U8K Mini LED 65\""},
]

BASE_PRICES = {
    1: 89990,  2: 104990, 3: 69990,  4: 79990,  5: 54990,
    6: 69990,  7: 39990,  8: 14990,  9: 12990,  10: 44990,
    11: 179990, 12: 139990, 13: 109990, 14: 129990,
    15: 219990, 16: 99990, 17: 119990, 18: 69990,
}

CITY_MULT = {
    "moscow": 1.00, "spb": 0.97, "almaty": 0.91,
    "astana": 0.93, "minsk": 0.88, "kyiv": 0.85,
}

STORE_NAMES = {
    "moscow": ["DNS", "М.Видео", "Ситилинк", "Эльдорадо", "Wildberries"],
    "spb":    ["DNS", "М.Видео", "Ситилинк", "Ретейл Парк", "Озон"],
    "almaty": ["Sulpak", "Technodom", "DNS", "Mechta", "Kaspi Shop"],
    "astana": ["Sulpak", "Technodom", "DNS", "MediaMart", "Kaspi Shop"],
    "minsk":  ["5element", "DNS", "Electrosfera", "Ozon.by", "21vek"],
    "kyiv":   ["Rozetka", "Comfy", "Allo", "Citrus", "Foxtrot"],
}


def make_mock_prices(city: str) -> list:
    """Generate realistic mock prices when real scraping unavailable."""
    mult = CITY_MULT.get(city, 1.0)
    stores = STORE_NAMES.get(city, STORE_NAMES["moscow"])
    products = []

    for p in PRODUCTS_TEMPLATE:
        base = BASE_PRICES[p["id"]] * mult
        store_count = random.randint(2, min(4, len(stores)))
        store_list = []
        for i in range(store_count):
            variance = 1 + (i * 0.03) + random.uniform(-0.03, 0.06)
            store_list.append({
                "name": stores[i % len(stores)],
                "price": round(base * variance),
                "url": f"https://example.com/{p['id']}/{stores[i % len(stores)].lower()}",
                "in_stock": True,
            })
        store_list.sort(key=lambda x: x["price"])

        avg_week = round(base * random.uniform(1.05, 1.12))
        products.append({
            **p,
            "stores": store_list,
            "minPrice": store_list[0]["price"],
            "avgWeekPrice": avg_week,
            "discount": max(0, round((1 - store_list[0]["price"] / avg_week) * 100)),
        })

    return products


def scrape_real_prices(city: str) -> list:
    """
    TODO: Implement real scraping here.
    Example structure for DNS:
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; HowMuchBot/1.0)',
    }
    
    For each product:
      1. Search on store website
      2. Parse price from HTML
      3. Return structured data
    
    Use time.sleep(random.uniform(1,3)) between requests.
    """
    # Fallback to mock for now
    return make_mock_prices(city)


def load_history(city: str, product_id: int) -> list:
    """Load existing price history and append today."""
    hist_file = DATA_DIR / f"history_{city}_{product_id}.json"
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if hist_file.exists():
        with open(hist_file) as f:
            history = json.load(f)
    else:
        history = []

    return history


def save_history(city: str, product_id: int, price: int, history: list):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    # Append if new day
    if not history or history[-1]["date"] != today:
        history.append({"date": today, "price": price})
    # Keep last 90 days
    history = history[-90:]

    hist_file = DATA_DIR / f"history_{city}_{product_id}.json"
    with open(hist_file, "w") as f:
        json.dump(history, f, ensure_ascii=False)
    return history


def main():
    print(f"🚀 How Much? Scraper — {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}")
    print(f"   Cities: {', '.join(CITIES)}")

    for city in CITIES:
        print(f"\n📍 Scraping {city}...")
        products = scrape_real_prices(city)

        # Attach history
        for p in products:
            hist = load_history(city, p["id"])
            hist = save_history(city, p["id"], p["minPrice"], hist)
            p["history"] = hist[-30:]  # Last 30 days in main file

        # Save main prices file
        out = {
            "city": city,
            "updated": datetime.now(timezone.utc).isoformat(),
            "products": products,
        }
        out_file = DATA_DIR / f"prices_{city}.json"
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)

        print(f"   ✅ Saved {len(products)} products → {out_file}")
        time.sleep(random.uniform(0.5, 1.5))

    print("\n✅ All cities updated!")


if __name__ == "__main__":
    main()
