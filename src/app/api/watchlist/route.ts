import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await prisma.watchlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { cardId, cardName, setName, cardNumber, imageUrl, source } = body;

  if (!cardId || !cardName) {
    return NextResponse.json({ error: "cardId and cardName are required" }, { status: 400 });
  }

  try {
    const item = await prisma.watchlistItem.upsert({
      where: { userId_cardId_source: { userId: session.user.id, cardId, source: source || "tcgplayer" } },
      update: {},
      create: { userId: session.user.id, cardId, cardName, setName, cardNumber, imageUrl, source: source || "tcgplayer" },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Watchlist add error:", error);
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cardId, source } = await req.json();
  await prisma.watchlistItem.deleteMany({
    where: { userId: session.user.id, cardId, source: source || "tcgplayer" },
  });
  return NextResponse.json({ success: true });
}
