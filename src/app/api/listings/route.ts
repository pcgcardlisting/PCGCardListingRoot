import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/listings — public, returns all active listings
export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type"); // "sell" | "trade" | null
  const search = req.nextUrl.searchParams.get("q") || "";

  const listings = await prisma.listing.findMany({
    where: {
      isActive: true,
      ...(type ? { listingType: type } : {}),
      ...(search ? { cardName: { contains: search } } : {}),
    },
    include: { user: { select: { id: true, name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ listings });
}

// POST /api/listings — create or update listing for a card
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { cardId, cardName, setName, cardNumber, imageUrl, tcgioId, rarity, listingType, price, wantedCard, description } = body;

  if (!cardId || !cardName) return NextResponse.json({ error: "cardId and cardName required" }, { status: 400 });
  if (listingType === "sell" && (!price || price <= 0)) return NextResponse.json({ error: "Selling price required" }, { status: 400 });
  if (listingType === "trade" && !wantedCard) return NextResponse.json({ error: "Wanted card required for trades" }, { status: 400 });

  const listing = await prisma.listing.upsert({
    where: { id: (await prisma.listing.findFirst({ where: { userId: session.user.id, cardId, isActive: true } }))?.id || "new" },
    update: { listingType, price: price || null, wantedCard: wantedCard || null, description: description || null, isActive: true, updatedAt: new Date() },
    create: { userId: session.user.id, cardId, cardName, setName, cardNumber, imageUrl, tcgioId, rarity, listingType, price: price || null, wantedCard: wantedCard || null, description: description || null },
  });

  return NextResponse.json({ listing }, { status: 201 });
}

// DELETE /api/listings — remove/deactivate listing
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cardId } = await req.json();
  await prisma.listing.updateMany({
    where: { userId: session.user.id, cardId, isActive: true },
    data: { isActive: false },
  });
  return NextResponse.json({ success: true });
}
