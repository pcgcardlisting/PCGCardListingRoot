# PCG Card Listing

A full-stack Next.js application for tracking Pokémon TCG card prices from **TCGPlayer** and **eBay** in real-time.

## Features

- 🔐 **Authentication** — Register/login with email+password or Google OAuth
- 🔍 **Card Search** — Search 20M+ cards from the TCGPlayer catalogue
- 📈 **TCGPlayer Prices** — Live market, low, mid, and high prices by card type
- 🛍️ **eBay Listings** — Real-time active listings with price comparison
- 📊 **Price History** — 30-day price trend charts using Recharts
- ⭐ **Watchlist** — Save and track your favourite cards

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | NextAuth.js v5 + Google OAuth |
| Database | SQLite via Prisma ORM |
| Styling | Tailwind CSS |
| Charts | Recharts |
| APIs | TCGPlayer API, eBay Browse API |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/pcgcardlisting/PCGCardListingRoot.git
cd PCGCardListingRoot
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | How to obtain |
|---|---|
| `AUTH_SECRET` | Run `npx auth secret` or any random 32-char string |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com/) → Credentials |
| `TCGPLAYER_PUBLIC_KEY` / `TCGPLAYER_PRIVATE_KEY` | [TCGPlayer Developer Portal](https://developer.tcgplayer.com/) |
| `EBAY_CLIENT_ID` / `EBAY_CLIENT_SECRET` | [eBay Developer Program](https://developer.ebay.com/) |

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/cards/search?q=` | GET | Search TCGPlayer cards |
| `/api/cards/[id]/prices` | GET | Get TCG + eBay prices for a card |
| `/api/ebay/search?q=` | GET | Search eBay listings |
| `/api/watchlist` | GET/POST/DELETE | Manage user watchlist |

## Notes

- If API keys are not configured, the app uses **realistic mock data** so you can explore the UI immediately.
- TCGPlayer historical price data is not available on the public API — the chart shows simulated 30-day trends.
- eBay uses the Browse API with OAuth client credentials flow (no user login required).

## Deployment

Deploy easily to [Vercel](https://vercel.com/) — set all environment variables in the project settings, and switch `DATABASE_URL` to a hosted database (e.g. [Turso](https://turso.tech/) for SQLite or [Neon](https://neon.tech/) for PostgreSQL).

---

Built by [@pcgcardlisting](https://github.com/pcgcardlisting)
