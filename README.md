# 🏠 Okinoshima House Hunter | 隠岐の島 家探し

A modern, bilingual (Japanese/English) web application for browsing vacant houses and land listings from the Okinoshima Town Akiya Bank (空き家・空き地バンク).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8.svg)

## ✨ Features

### 🗺️ Interactive Map View
- Leaflet-powered interactive map centered on Okinoshima Island
- Color-coded markers:
  - 🔵 Blue: Vacant houses (空き家)
  - 🟢 Green: Vacant land (空き地)
  - 🟡 Amber: Under negotiation (商談中)
  - 🔴 Red: Favorited properties
- Click markers to view property details
- Automatic zoom to selected property

### 📋 List View
- Responsive card layout
- Property images with fallback placeholders
- At-a-glance pricing (JPY and USD)
- Property type badges
- Favorite and rating indicators

### 🔍 Advanced Filtering & Sorting
- Full-text search (ID, location, description)
- Filter by property type (houses, land, all)
- Filter by availability (available only, favorites only)
- Price range slider
- Sort by newest, price low-to-high, or price high-to-low

### 📝 Personal Property Tracking
- ⭐ 5-star rating system
- ❤️ Favorites list
- 📝 Personal notes per property
- Status tracking: Interested → Visited → Applied → Passed
- All data persisted to localStorage

### 🌐 Bilingual Support
- Full Japanese and English translations
- Location and district name translations
- Property description translations
- One-click language toggle

### 💱 Live Exchange Rates
- Real-time USD/JPY exchange rate from Frankfurter API
- Automatic rate caching (6-hour expiry)
- Fallback rate when offline
- Rate indicator in header

### 🔄 Live Data Fetching
- Fetches property listings directly from official Okinoshima Town website
- Multi-page pagination support (all ~90 properties)
- CORS proxy fallback chain for reliability
- Local caching with 1-hour expiry
- Fallback to sample data if fetching fails

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/okinoshima-house-hunter.git
cd okinoshima-house-hunter

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment

No environment variables required. The application uses:
- Public CORS proxies for fetching data
- Frankfurter API for exchange rates (no API key needed)
- localStorage for user data persistence

## 📁 Project Structure

```
src/
├── components/
│   ├── MapView.tsx        # Leaflet map component
│   ├── PropertyCard.tsx   # Property list card
│   └── PropertyDetail.tsx # Property detail modal
├── data/
│   └── properties.ts      # Property types & fallback data
├── hooks/
│   ├── useNotes.ts        # Notes, favorites, ratings state
│   └── useProperties.ts   # Property fetching & caching
├── services/
│   ├── scraper.ts         # HTML scraping logic
│   └── exchangeRate.ts    # Exchange rate API
├── i18n.tsx               # Internationalization
└── App.tsx                # Main application
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [React 18](https://react.dev/) | UI framework |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Vite](https://vitejs.dev/) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Leaflet](https://leafletjs.com/) | Interactive maps |
| [Frankfurter API](https://frankfurter.dev/) | Exchange rates |

## 📊 Data Source

Property data is scraped from the official [Okinoshima Town Akiya Bank](https://www.town.okinoshima.shimane.jp/www/contents/1530689936498/index.html) website. The scraper:

1. Fetches listing pages via CORS proxy
2. Parses HTML to extract property details
3. Handles multi-page pagination
4. Caches results locally for performance
5. Falls back to sample data on failure

### Data Fields Extracted
- Property ID and listing code
- Type (house/land/shop)
- Transaction type (sale/rent)
- Negotiation status
- Location and district
- Price
- Layout (for houses)
- Land area (for vacant land)
- Description
- Contact information
- Images and PDF documents

## 🌏 About Okinoshima

[Okinoshima (隠岐の島)](https://en.wikipedia.org/wiki/Okinoshima,_Shimane) is the largest island in the Oki Islands chain, located in the Sea of Japan about 50km off the coast of Shimane Prefecture, Japan. The town operates an "Akiya Bank" (vacant house bank) program to connect vacant property owners with potential buyers or renters, promoting rural revitalization.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is an unofficial tool created for educational and personal use. It is not affiliated with or endorsed by Okinoshima Town (隠岐の島町). Property data is sourced from publicly available information on the official town website. Always verify property details directly with the town office or listed contacts before making any decisions.

## 🙏 Acknowledgments

- [Okinoshima Town](https://www.town.okinoshima.shimane.jp/) for the public property listings
- [OpenStreetMap](https://www.openstreetmap.org/) contributors for map tiles
- [Frankfurter](https://frankfurter.dev/) for free exchange rate API
- [AllOrigins](https://allorigins.win/) and other CORS proxy providers

---

<p align="center">
  Made with ❤️ for anyone looking to find their dream home on Okinoshima Island
  <br>
  隠岐の島での理想の家探しを応援しています
</p>
