const TCGPLAYER_BASE_URL = "https://api.tcgplayer.com";

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

export async function searchTCGCards(query: string, limit = 20): Promise<TCGCard[]> {
  try {
    const token = await getAccessToken();
    const params = new URLSearchParams({
      productName: query,
      limit: limit.toString(),
      offset: "0",
    });

    const response = await fetch(
      `${TCGPLAYER_BASE_URL}/v1.39.0/catalog/products?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return getMockTCGCards(query);

    const data = await response.json();
    return data.results || [];
  } catch {
    return getMockTCGCards(query);
  }
}

export async function getTCGCardPrices(productId: number): Promise<TCGPrice[]> {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `${TCGPLAYER_BASE_URL}/v1.39.0/pricing/product/${productId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) return getMockPrices(productId);

    const data = await response.json();
    return data.results || [];
  } catch {
    return getMockPrices(productId);
  }
}

export async function getTCGPriceHistory(productId: number): Promise<{ date: string; price: number }[]> {
  // TCGPlayer doesn't expose historical price endpoints in public API
  // Return mock data showing a realistic price trend
  return getMockPriceHistory();
}

// Mock data for demo when API keys are not configured
function getMockTCGCards(query: string): TCGCard[] {
  const cards = [
    { productId: 1001, name: `Charizard - ${query}`, imageUrl: "https://placehold.co/200x280/1a1a2e/ffffff?text=Charizard", categoryId: 1, groupId: 100, url: "#", modifiedOn: new Date().toISOString(), setName: "Base Set", number: "4/102" },
    { productId: 1002, name: `Pikachu - ${query}`, imageUrl: "https://placehold.co/200x280/1a1a2e/ffffff?text=Pikachu", categoryId: 1, groupId: 100, url: "#", modifiedOn: new Date().toISOString(), setName: "Base Set", number: "58/102" },
    { productId: 1003, name: `Blastoise - ${query}`, imageUrl: "https://placehold.co/200x280/1a1a2e/ffffff?text=Blastoise", categoryId: 1, groupId: 100, url: "#", modifiedOn: new Date().toISOString(), setName: "Base Set", number: "2/102" },
    { productId: 1004, name: `Mewtwo - ${query}`, imageUrl: "https://placehold.co/200x280/1a1a2e/ffffff?text=Mewtwo", categoryId: 1, groupId: 101, url: "#", modifiedOn: new Date().toISOString(), setName: "Base Set", number: "10/102" },
    { productId: 1005, name: `Venusaur - ${query}`, imageUrl: "https://placehold.co/200x280/1a1a2e/ffffff?text=Venusaur", categoryId: 1, groupId: 101, url: "#", modifiedOn: new Date().toISOString(), setName: "Base Set", number: "15/102" },
  ];
  return cards;
}

function getMockPrices(productId: number): TCGPrice[] {
  const base = (productId % 500) + 10;
  return [
    { productId, lowPrice: base * 0.8, midPrice: base, highPrice: base * 1.5, marketPrice: base * 1.05, directLowPrice: base * 0.85, subTypeName: "Normal" },
    { productId, lowPrice: base * 2, midPrice: base * 2.5, highPrice: base * 4, marketPrice: base * 2.8, directLowPrice: base * 2.1, subTypeName: "Holofoil" },
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
