# PCG Card Listing

A full-stack Next.js application for tracking Pokémon TCG card prices from **TCGPlayer** and **eBay** in real-time, with a built-in **Marketplace** and **Chat** system for collectors to buy and trade cards directly.

---

## 🚀 Quick Start on a New Machine

```bash
# 1. Clone the repo
git clone https://github.com/pcgcardlisting/PCGCardListingRoot.git
cd PCGCardListingRoot

# 2. Run the setup script (installs deps, creates .env, sets up DB)
node setup.js

# 3. Fill in your API keys in .env (see Configuration below)

# 4. Start the app
npm run dev
```

Then open **http://localhost:3000**

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Auth** | Register/login with email+password or Google OAuth |
| 🔍 **Card Search** | Search any Pokémon card via pokemon-tcg.io (free, no key needed) |
| 📈 **TCGPlayer Prices** | Market, Low, Mid, High prices by card type |
| 🛍️ **eBay Listings** | Live eBay listings with price summary |
| 📊 **Price History** | 30-day price trend chart per card |
| ⭐ **Watchlist** | Save and track favourite cards |
| 📌 **Top 5 Dashboard** | Pin up to 5 cards with live prices at a glance |
| 🏪 **Marketplace** | List pinned cards for sale or trade — visible to all visitors |
| 💬 **Chat** | Buyer/seller messaging on each listing (3s polling) |

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Auth | NextAuth.js v5 + Google OAuth + bcrypt |
| Database | SQLite via Prisma ORM v7 + libsql adapter |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Card Data | pokemon-tcg.io API (free) |
| Prices | TCGPlayer API + eBay Browse API |

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="any-random-32-char-string"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth — https://console.cloud.google.com/ → APIs → Credentials
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# TCGPlayer — https://developer.tcgplayer.com/ (optional — app works without it)
TCGPLAYER_PUBLIC_KEY="..."
TCGPLAYER_PRIVATE_KEY="..."

# eBay — https://developer.ebay.com/ (optional — app works without it)
EBAY_CLIENT_ID="..."
EBAY_CLIENT_SECRET="..."
EBAY_ENVIRONMENT="production"
```

> **Note:** The app works fully without TCGPlayer and eBay keys — it uses the free pokemon-tcg.io API for card search and images, and shows mock price data for the charts.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Landing page + Marketplace
│   ├── login/page.tsx            # Login
│   ├── register/page.tsx         # Register
│   ├── dashboard/
│   │   ├── page.tsx              # Dashboard (server, auth-gated)
│   │   └── DashboardClient.tsx   # Dashboard UI
│   └── api/
│       ├── auth/                 # NextAuth + register
│       ├── cards/                # Card search + prices
│       ├── ebay/                 # eBay search
│       ├── watchlist/            # User watchlist CRUD
│       ├── pinned/               # Top 5 pins CRUD
│       ├── listings/             # Marketplace listings CRUD
│       └── chat/                 # Chat rooms + messages
├── components/
│   ├── CardSearch.tsx            # Card search panel
│   ├── CardPricePanel.tsx        # Price detail + chart
│   ├── Watchlist.tsx             # Watchlist panel
│   ├── Top5Widget.tsx            # Top 5 pins + marketplace listing
│   ├── Marketplace.tsx           # Public marketplace grid
│   └── ChatWindow.tsx            # Buyer/seller chat modal
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Prisma client
│   ├── tcgplayer.ts              # TCGPlayer + pokemon-tcg.io
│   ├── ebay.ts                   # eBay API
│   └── utils.ts                  # Helpers
└── hooks/
    └── useDebounce.ts
```

---

## 🗄️ Database Models

- **User** — auth, profile
- **Account / Session / VerificationToken** — NextAuth
- **WatchlistItem** — saved cards per user
- **PinnedCard** — top 5 pinned cards per user (max 5)
- **Listing** — marketplace listings (sell or trade)
- **ChatRoom** — one room per listing+buyer pair
- **Message** — chat messages

---

## 🌐 API Endpoints

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | No | Register new user |
| `/api/cards/search?q=` | GET | No | Search cards |
| `/api/cards/[id]/prices` | GET | No | TCG + eBay prices |
| `/api/ebay/search?q=` | GET | No | eBay listings |
| `/api/watchlist` | GET/POST/DELETE | Yes | Watchlist |
| `/api/pinned` | GET/POST/DELETE/PATCH | Yes | Top 5 pins |
| `/api/listings` | GET | No | Public marketplace |
| `/api/listings` | POST/DELETE | Yes | Manage own listings |
| `/api/listings/mine` | GET | Yes | Own listings |
| `/api/chat` | GET/POST | Yes | Chat rooms + messages |
| `/api/chat/rooms` | GET | Yes | All chat rooms |

---

## 🚢 Deploying to Vercel

1. Push to GitHub (already done ✅)
2. Go to [vercel.com](https://vercel.com) → Import the `PCGCardListingRoot` repo
3. Set all environment variables from `.env`
4. Change `DATABASE_URL` to a hosted DB — e.g. [Turso](https://turso.tech/) for SQLite-compatible

---

Built by [@pcgcardlisting](https://github.com/pcgcardlisting)
