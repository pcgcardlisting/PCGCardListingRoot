// TCGPlayer API integration with pokemon-tcg.io fallback for card search
// pokemon-tcg.io is a free public API — no key required for basic search

const TCGPLAYER_BASE_URL = "https://api.tcgplayer.com";
const POKEMON_TCG_IO = "https://api.pokemontcg.io/v2";

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const response = await fetch(`${TCGPLAYER_BASE_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.TCGPLAYER_PUBLIC_KEY!,
      client_secret: process.env.TCGPLAYER_PRIVATE_KEY!,
    }),
  });

  if (!response.ok) throw new Error("Failed to get TCGPlayer access token");

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60000;
  return accessToken!;
}

export interface TCGCard {
  productId: number;
  name: string;
  imageUrl: string;
  categoryId: number;
  groupId: number;
  url: string;
  modifiedOn: string;
  setName?: string;
  number?: string;
  // pokemon-tcg.io fields
  tcgioId?: string;
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  rarity?: string;
}

export interface TCGPrice {
  productId: number;
  lowPrice: number | null;
  midPrice: number | null;
  highPrice: number | null;
  marketPrice: number | null;
  directLowPrice: number | null;
  subTypeName: string;
}

// ---------- Main search — uses pokemon-tcg.io (free, real data) ----------

export async function searchTCGCards(query: string, limit = 20): Promise<TCGCard[]> {
  // First try TCGPlayer if keys are configured
  if (process.env.TCGPLAYER_PUBLIC_KEY && process.env.TCGPLAYER_PUBLIC_KEY !== "your-tcgplayer-public-key") {
    try {
      const token = await getAccessToken();
      const params = new URLSearchParams({ productName: query, limit: limit.toString(), offset: "0" });
      const response = await fetch(`${TCGPLAYER_BASE_URL}/v1.39.0/catalog/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results?.length > 0) return data.results;
      }
    } catch { /* fall through to pokemon-tcg.io */ }
  }

  // Always use pokemon-tcg.io as the search engine (free, no key, real data)
  return searchPokemonTCGio(query, limit);
}

async function searchPokemonTCGio(query: string, limit: number): Promise<TCGCard[]> {
  try {
    // Search by card name — supports partial matches
    const params = new URLSearchParams({
      q: `name:"${query}*"`,
      pageSize: limit.toString(),
      orderBy: "-set.releaseDate",
      select: "id,name,images,set,number,supertype,subtypes,hp,rarity,tcgplayer",
    });

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (process.env.POKEMON_TCG_API_KEY) {
      headers["X-Api-Key"] = process.env.POKEMON_TCG_API_KEY;
    }

    const response = await fetch(`${POKEMON_TCG_IO}/cards?${params}`, { headers });

    if (!response.ok) return [];

    const data = await response.json();
    const cards: TCGCard[] = (data.data || []).map((card: PokemonTCGioCard, idx: number) => ({
      productId: hashCardId(card.id) + idx,
      tcgioId: card.id,
      name: card.name,
      imageUrl: card.images?.large || card.images?.small || "",
      categoryId: 1,
      groupId: 100,
      url: card.tcgplayer?.url || `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(card.name)}`,
      modifiedOn: new Date().toISOString(),
      setName: card.set?.name,
      number: card.number,
      supertype: card.supertype,
      subtypes: card.subtypes,
      hp: card.hp,
      rarity: card.rarity,
    }));

    return cards;
  } catch {
    return [];
  }
}

interface PokemonTCGioCard {
  id: string;
  name: string;
  images?: { small?: string; large?: string };
  set?: { name?: string; releaseDate?: string };
  number?: string;
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  rarity?: string;
  tcgplayer?: { url?: string; prices?: Record<string, { low?: number; mid?: number; high?: number; market?: number }> };
}

// Deterministic numeric ID from a string card ID like "base1-4"
function hashCardId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

// ---------- Price fetching ----------

export async function getTCGCardPrices(productId: number, tcgioId?: string): Promise<TCGPrice[]> {
  // Try to get prices from pokemon-tcg.io if we have the tcgioId
  if (tcgioId) {
    try {
      const headers: Record<string, string> = {};
      if (process.env.POKEMON_TCG_API_KEY) headers["X-Api-Key"] = process.env.POKEMON_TCG_API_KEY;
      const res = await fetch(`${POKEMON_TCG_IO}/cards/${tcgioId}?select=id,tcgplayer`, { headers });
      if (res.ok) {
        const data = await res.json();
        const prices = data.data?.tcgplayer?.prices;
        if (prices) {
          return Object.entries(prices).map(([subtype, p]: [string, unknown]) => {
            const price = p as { low?: number; mid?: number; high?: number; market?: number; directLow?: number };
            return {
              productId,
              subTypeName: subtype.charAt(0).toUpperCase() + subtype.slice(1).replace(/([A-Z])/g, " $1"),
              lowPrice: price.low ?? null,
              midPrice: price.mid ?? null,
              highPrice: price.high ?? null,
              marketPrice: price.market ?? null,
              directLowPrice: price.directLow ?? null,
            };
          });
        }
      }
    } catch { /* fall through */ }
  }

  // TCGPlayer API fallback
  if (process.env.TCGPLAYER_PUBLIC_KEY && process.env.TCGPLAYER_PUBLIC_KEY !== "your-tcgplayer-public-key") {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${TCGPLAYER_BASE_URL}/v1.39.0/pricing/product/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.results?.length > 0) return data.results;
      }
    } catch { /* fall through */ }
  }

  return getMockPrices(productId);
}

export async function getTCGPriceHistory(productId: number): Promise<{ date: string; price: number }[]> {
  return getMockPriceHistory();
}

function getMockPrices(productId: number): TCGPrice[] {
  const base = (productId % 500) + 10;
  return [
    { productId, lowPrice: +(base * 0.8).toFixed(2), midPrice: +base.toFixed(2), highPrice: +(base * 1.5).toFixed(2), marketPrice: +(base * 1.05).toFixed(2), directLowPrice: +(base * 0.85).toFixed(2), subTypeName: "Normal" },
    { productId, lowPrice: +(base * 2).toFixed(2), midPrice: +(base * 2.5).toFixed(2), highPrice: +(base * 4).toFixed(2), marketPrice: +(base * 2.8).toFixed(2), directLowPrice: +(base * 2.1).toFixed(2), subTypeName: "Holofoil" },
  ];
}

function getMockPriceHistory(): { date: string; price: number }[] {
  const history = [];
  const now = new Date();
  let price = 50 + Math.random() * 50;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    price = price + (Math.random() - 0.45) * 5;
    history.push({ date: date.toISOString().split("T")[0], price: Math.max(10, Math.round(price * 100) / 100) });
  }
  return history;
}
