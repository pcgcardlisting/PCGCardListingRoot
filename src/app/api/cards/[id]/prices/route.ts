import { NextRequest, NextResponse } from "next/server";
import { getTCGCardPrices, getTCGPriceHistory } from "@/lib/tcgplayer";
import { getEbayPriceSummary, searchEbayListings } from "@/lib/ebay";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);
  const cardName = req.nextUrl.searchParams.get("name") || "";

  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const [tcgPrices, priceHistory, ebayData, ebayListings] = await Promise.all([
      getTCGCardPrices(productId),
      getTCGPriceHistory(productId),
      getEbayPriceSummary(cardName),
      searchEbayListings(cardName, 6),
    ]);

    return NextResponse.json({
      tcgPrices,
      priceHistory,
      ebayData,
      ebayListings: ebayListings.itemSummaries,
    });
  } catch (error) {
    console.error("Card prices error:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
