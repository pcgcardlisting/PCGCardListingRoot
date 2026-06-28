const EBAY_BASE_URL =
  process.env.EBAY_ENVIRONMENT === "sandbox"
    ? "https://api.sandbox.ebay.com"
    : "https://api.ebay.com";

let ebayToken: string | null = null;
let ebayTokenExpiry: number = 0;

async function getEbayToken(): Promise<string> {
  if (ebayToken && Date.now() < ebayTokenExpiry) return ebayToken;

  const credentials = Buffer.from(
    `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`${EBAY_BASE_URL}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
  });

  if (!response.ok) throw new Error("Failed to get eBay access token");

  const data = await response.json();
  ebayToken = data.access_token;
  ebayTokenExpiry = Date.now() + data.expires_in * 1000 - 60000;
  return ebayToken!;
}

export interface EbayListing {
  itemId: string;
  title: string;
  price: { value: string; currency: string };
  image?: { imageUrl: string };
  itemWebUrl: string;
  condition?: string;
  seller?: { username: string; feedbackScore: number };
  shippingOptions?: { shippingCost?: { value: string } }[];
}

export interface EbaySearchResult {
  itemSummaries: EbayListing[];
  total: number;
}

export async function searchEbayListings(
  query: string,
  limit = 10
): Promise<EbaySearchResult> {
  try {
    const token = await getEbayToken();
    const params = new URLSearchParams({
      q: query,
      limit: limit.toString(),
      category_ids: "2536",
      filter: "buyingOptions:{FIXED_PRICE}",
      sort: "price",
    });

    const response = await fetch(
      `${EBAY_BASE_URL}/buy/browse/v1/item_summary/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
      }
    );

    if (!response.ok) return getMockEbayListings(query);

    const data = await response.json();
    return { itemSummaries: data.itemSummaries || [], total: data.total || 0 };
  } catch {
    return getMockEbayListings(query);
  }
}

export async function getEbayPriceSummary(query: string): Promise<{
  lowestPrice: number;
  averagePrice: number;
  highestPrice: number;
  totalListings: number;
}> {
  try {
    const results = await searchEbayListings(query, 20);
    const prices = results.itemSummaries
      .map((item) => parseFloat(item.price.value))
      .filter((p) => !isNaN(p));

    if (prices.length === 0) return { lowestPrice: 0, averagePrice: 0, highestPrice: 0, totalListings: 0 };

    return {
      lowestPrice: Math.min(...prices),
      averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      highestPrice: Math.max(...prices),
      totalListings: results.total,
    };
  } catch {
    return { lowestPrice: 0, averagePrice: 0, highestPrice: 0, totalListings: 0 };
  }
}

function getMockEbayListings(query: string): EbaySearchResult {
  const listings: EbayListing[] = Array.from({ length: 8 }, (_, i) => {
    const price = (20 + Math.random() * 200).toFixed(2);
    return {
      itemId: `ebay_${i + 1}`,
      title: `${query} Pokemon Card ${["PSA 10", "PSA 9", "BGS 9.5", "Ungraded", "Near Mint"][i % 5]}`,
      price: { value: price, currency: "USD" },
      image: { imageUrl: `https://placehold.co/200x280/0f3460/ffffff?text=${encodeURIComponent(query)}` },
      itemWebUrl: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`,
      condition: ["Brand New", "Like New", "Very Good", "Good"][i % 4],
      seller: { username: `seller_${i + 1}`, feedbackScore: 98 + (i % 3) },
      shippingOptions: [{ shippingCost: { value: (i % 3 === 0 ? "0.00" : "3.99") } }],
    };
  });
  return { itemSummaries: listings, total: listings.length };
}
