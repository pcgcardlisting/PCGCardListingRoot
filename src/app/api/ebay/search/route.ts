import { NextRequest, NextResponse } from "next/server";
import { searchEbayListings } from "@/lib/ebay";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  try {
    const results = await searchEbayListings(query, limit);
    return NextResponse.json(results);
  } catch (error) {
    console.error("eBay search error:", error);
    return NextResponse.json({ error: "Failed to search eBay listings" }, { status: 500 });
  }
}
