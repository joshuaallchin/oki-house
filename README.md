# 🏠 Okinoshima House Hunter | 隠岐の島 家探し

A modern, bilingual (Japanese/English) web application for browsing vacant house and land listings from the [Okinoshima Town Akiya Bank](https://www.town.okinoshima.shimane.jp/cgi-bin/recruit.php/1/list/?ck=1) (空き家・空き地バンク). Data is fetched live from the official town website on every visit.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8.svg)
![Deploy](https://img.shields.io/badge/deploy-GitHub_Pages-222.svg?logo=github)

---

## ✨ Features

### 🔴 Live Data
- Fetches **all paginated pages** from the official Okinoshima town website on every load
- Parses listings directly from the source HTML — no backend required
- **1-hour localStorage cache** keeps repeat visits instant
- Manual **Refresh** button in the header to force a re-fetch
- Status badge: **Live** (green) · **Cached** (yellow) · **Sample** (grey fallback)

### 🗺️ Interactive Map View
- Leaflet-powered map centred on Okinoshima Island
- Color-coded circle markers:
  - 🔵 Blue — Vacant house (空き家)
  - 🟢 Green — Vacant land (空き地)
  - 🟡 Amber — Under negotiation (商談中)
  - 🔴 Red — Favourited property
- Tooltip on hover: listing code, price, location, layout
- Click a marker to open the detail panel
- Fly-to animation when a property is selected from the list

### 📋 List / Split View
- Responsive card layout (1–4 columns depending on viewport)
- Property images loaded from the official site with emoji fallback placeholders
- Price shown in both **JPY** and **USD** (live exchange rate)
- Type badge, availability badge, star rating and note count at a glance
- "Show on Map" shortcut on every card

### 🔍 Filtering & Sorting
- Full-text search by ID, location or description
- Property type filter: All · Houses · Land
- Price ceiling slider
- Availability filter (exclude properties under negotiation)
- Favourites-only filter
- Sort: Newest · Price low→high · Price high→low

### 📝 Personal Property Tracking *(all stored locally)*
- ⭐ 1–5 star rating
- ❤️ Favourites
- 📝 Timestamped notes per property (add / edit / delete)
- Status workflow: Not Set → Interested → Visited → Applied → Passed
- Everything persisted to **localStorage** — survives page refreshes and redeploys

### 💱 Live Exchange Rates
- Fetches the current USD/JPY rate from [Frankfurter API](https://www.frankfurter.app/) (free, no key)
- Displayed in the header: `💱 $1 = ¥XXX`
- 6-hour cache so it isn't fetched on every single render
- Graceful fallback to ¥150 if the API is unreachable

### 🌐 Bilingual (EN / JA)
- Full UI translations for Japanese and English
- Translated location names, district names and common description phrases
- Language preference saved to localStorage

---

## 🚀 Deployment

### GitHub Pages (recommended)

The repo ships with a GitHub Actions workflow that builds and deploys automatically.

**One-time setup:**

1. Push the repo to GitHub.
2. Go to **Settings → Pages → Source** and select **GitHub Actions**.
3. Push to `main` (or trigger manually via **Actions → Deploy to GitHub Pages → Run workflow**).

The workflow lives at `.github/workflows/deploy.yml`. Because the build uses `vite-plugin-singlefile`, the entire app is bundled into a **single `index.html`** with all JS and CSS inlined — no relative asset paths, no subpath configuration needed.

> **Why `viteSingleFile`?**  
> GitHub Pages serves from `https://user.github.io/repo-name/`. Normally Vite needs a `base` option set to the repo name or asset links break. `viteSingleFile` sidesteps the issue entirely by inlining everything — there are no external asset references to go wrong.

> **Why is Leaflet CSS in `index.html` and not imported in the component?**  
> Leaflet's CSS references binary PNG marker sprites via `url()`. `viteSingleFile` cannot inline binary assets, which caused a **white screen** on GitHub Pages. Loading the Leaflet stylesheet from the unpkg CDN instead solves this completely.

### Local development

```bash
npm install
npm run dev        # starts Vite dev server at http://localhost:5173
```

### Build locally

```bash
npm run build      # outputs dist/index.html (single self-contained file)
npm run preview    # serves the built file locally
```

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── MapView.tsx          # Leaflet map with circle markers
│   ├── PropertyCard.tsx     # Card used in list/split view
│   └── PropertyDetail.tsx   # Modal with full property info + notes
├── data/
│   └── properties.ts        # Fallback sample data + Property type
├── hooks/
│   ├── useNotes.ts          # localStorage: notes, favourites, ratings, statuses
│   └── useProperties.ts     # Orchestrates live fetch → cache → fallback
├── services/
│   ├── scraper.ts           # CORS-proxy HTML scraper + pagination
│   └── exchangeRate.ts      # Frankfurter API wrapper with 6h cache
├── i18n.tsx                 # Language context, translations, formatPrice
├── App.tsx                  # Root layout, filters, view modes
└── main.tsx                 # React entry point

.github/
└── workflows/
    └── deploy.yml           # GitHub Pages CI/CD workflow

index.html                   # Leaflet CSS CDN link lives here
```

---

## 🌐 Data Sources

| Source | Purpose |
|---|---|
| [Okinoshima Town Akiya Bank](https://www.town.okinoshima.shimane.jp/cgi-bin/recruit.php/1/list/?ck=1) | Property listings (HTML scrape via CORS proxy) |
| [allorigins.win](https://allorigins.win) | Primary CORS proxy |
| [corsproxy.io](https://corsproxy.io) | Secondary CORS proxy |
| [Frankfurter API](https://www.frankfurter.app/) | Live USD/JPY exchange rate |
| [OpenStreetMap](https://www.openstreetmap.org/) | Map tiles via Leaflet |

### How the scraper works

1. Fetches `https://www.town.okinoshima.shimane.jp/cgi-bin/recruit.php/1/list/?ck=1` through a CORS proxy
2. Parses property IDs, listing codes, prices, types, districts, locations, images, PDFs and descriptions from the HTML
3. Paginates automatically (`&page=2`, `&page=3`, …) until a page returns fewer than 20 results
4. Caches the full result in `localStorage` for 1 hour
5. Falls back to hardcoded sample data if all proxies fail

### localStorage keys

| Key | TTL | Contents |
|---|---|---|
| `okinoshima-properties-cache` | 1 hour | Scraped property array + timestamp |
| `okinoshima-exchange-rate` | 6 hours | USD/JPY rate + timestamp |
| `okinoshima-notes` | Permanent | Per-property notes |
| `okinoshima-favorites` | Permanent | Favourite property IDs |
| `okinoshima-ratings` | Permanent | Per-property star ratings |
| `okinoshima-statuses` | Permanent | Per-property status |
| `okinoshima-language` | Permanent | UI language preference |

> **Does localStorage work on GitHub Pages?**  
> Yes. localStorage is entirely browser-side and has nothing to do with the hosting provider. Your notes, favourites and cached data persist across page reloads and even across new deployments.

---

## ⚠️ Disclaimer

This project is an independent tool built to make the official Okinoshima akiya bank more accessible. It is not affiliated with, endorsed by, or maintained by Okinoshima Town (隠岐の島町). All property data belongs to the town and the respective listing agents. Always verify details on the [official website](https://www.town.okinoshima.shimane.jp/cgi-bin/recruit.php/1/list/?ck=1) before making any decisions.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements

- [Okinoshima Town (隠岐の島町)](https://www.town.okinoshima.shimane.jp/) for maintaining the public akiya bank
- [Leaflet](https://leafletjs.com/) for the mapping library
- [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) for map tiles
- [Frankfurter](https://www.frankfurter.app/) for the free exchange rate API
- [allorigins.win](https://allorigins.win) & [corsproxy.io](https://corsproxy.io) for CORS proxy services
