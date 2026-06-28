import { NextRequest, NextResponse } from "next/server";
import { searchTCGCards } from "@/lib/tcgplayer";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
  }

  try {
    const cards = await searchTCGCards(query, limit);
    return NextResponse.json({ cards });
  } catch (error) {
    console.error("TCGPlayer search error:", error);
    return NextResponse.json({ error: "Failed to search cards" }, { status: 500 });
  }
}
