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
  // Detect One Piece queries — route to One Piece Card Game API
  const isOnePiece = isOnePieceQuery(query);
  if (isOnePiece) return searchOnePieceCards(query, limit);

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

// ── One Piece detection ──────────────────────────────────────────────────────
const ONE_PIECE_KEYWORDS = [
  "luffy", "zoro", "nami", "sanji", "chopper", "robin", "franky", "brook", "jinbe",
  "shanks", "whitebeard", "kaido", "big mom", "ace", "sabo", "law", "hancock",
  "one piece", "op-01", "op-02", "op-03", "op-04", "op-05", "op-06", "op-07", "op-08",
  "op-09", "op-10", "romance dawn", "paramount war", "pillars of strength",
  "kingdoms of intrigue", "new four emperors", "wings of the captain",
  "five hundred years in the future", "emperors in the new world",
];

function isOnePieceQuery(query: string): boolean {
  const q = query.toLowerCase();
  return ONE_PIECE_KEYWORDS.some((kw) => q.includes(kw));
}

// One Piece TCG search via optcg-excel unofficial API (community data)
async function searchOnePieceCards(query: string, limit: number): Promise<TCGCard[]> {
  try {
    const params = new URLSearchParams({ name: query });
    const response = await fetch(`https://apiv2.optcgapi.com/cards?${params}`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      const cards = (data.data || data || []).slice(0, limit);
      return cards.map((card: OnePieceCard, idx: number) => ({
        productId: hashCardId(card.id || card.code || `op-${idx}`) + idx,
        tcgioId: card.id || card.code,
        name: card.name,
        imageUrl: card.images?.large || card.image || card.images?.small || "",
        categoryId: 2,
        groupId: 200,
        url: `https://en.onepiece-cardgame.com/cardlist/?series=${encodeURIComponent(card.set || "")}`,
        modifiedOn: new Date().toISOString(),
        setName: card.set || card.expansion || "One Piece TCG",
        number: card.number || card.code,
        supertype: card.type || "Character",
        rarity: card.rarity,
      }));
    }
  } catch { /* fall through to static mock */ }

  // Static fallback with real One Piece card images
  return getOnePieceMockCards(query);
}

interface OnePieceCard {
  id?: string;
  code?: string;
  name: string;
  images?: { small?: string; large?: string };
  image?: string;
  set?: string;
  expansion?: string;
  number?: string;
  type?: string;
  rarity?: string;
}

function getOnePieceMockCards(query: string): TCGCard[] {
  const all: TCGCard[] = [
    { productId: 2001, tcgioId: "OP01-001", name: "Monkey D. Luffy", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-001.png", categoryId: 2, groupId: 200, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Romance Dawn", number: "OP01-001", supertype: "Leader", rarity: "L" },
    { productId: 2002, tcgioId: "OP01-002", name: "Roronoa Zoro", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-025.png", categoryId: 2, groupId: 200, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Romance Dawn", number: "OP01-025", supertype: "Character", rarity: "SR" },
    { productId: 2003, tcgioId: "OP01-003", name: "Nami", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-016.png", categoryId: 2, groupId: 200, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Romance Dawn", number: "OP01-016", supertype: "Character", rarity: "R" },
    { productId: 2004, tcgioId: "OP01-004", name: "Sanji", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-013.png", categoryId: 2, groupId: 200, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Romance Dawn", number: "OP01-013", supertype: "Character", rarity: "SR" },
    { productId: 2005, tcgioId: "OP02-001", name: "Portgas D. Ace", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP02-013.png", categoryId: 2, groupId: 201, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Paramount War", number: "OP02-013", supertype: "Character", rarity: "SR" },
    { productId: 2006, tcgioId: "OP02-002", name: "Whitebeard", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP02-001.png", categoryId: 2, groupId: 201, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Paramount War", number: "OP02-001", supertype: "Leader", rarity: "L" },
    { productId: 2007, tcgioId: "OP03-001", name: "Trafalgar D. Water Law", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP03-099.png", categoryId: 2, groupId: 202, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Pillars of Strength", number: "OP03-099", supertype: "Character", rarity: "SR" },
    { productId: 2008, tcgioId: "OP04-001", name: "Shanks", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP04-001.png", categoryId: 2, groupId: 203, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Kingdoms of Intrigue", number: "OP04-001", supertype: "Leader", rarity: "L" },
    { productId: 2009, tcgioId: "OP05-001", name: "Kaido", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP05-001.png", categoryId: 2, groupId: 204, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Awakening of the New Era", number: "OP05-001", supertype: "Leader", rarity: "L" },
    { productId: 2010, tcgioId: "OP06-001", name: "Nico Robin", imageUrl: "https://en.onepiece-cardgame.com/images/cardlist/card/OP01-024.png", categoryId: 2, groupId: 200, url: "https://en.onepiece-cardgame.com/cardlist/", modifiedOn: new Date().toISOString(), setName: "Romance Dawn", number: "OP01-024", supertype: "Character", rarity: "R" },
  ];
  const q = query.toLowerCase();
  const filtered = all.filter((c) => c.name.toLowerCase().includes(q));
  return filtered.length > 0 ? filtered : all;
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
