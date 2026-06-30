import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const pins = await prisma.pinnedCard.findMany({
    where: { userId: session.user.id },
    orderBy: { position: "asc" },
  });
  return NextResponse.json({ pins });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { cardId, cardName, setName, cardNumber, imageUrl, tcgioId, rarity } = body;

  if (!cardId || !cardName) {
    return NextResponse.json({ error: "cardId and cardName are required" }, { status: 400 });
  }

  // Count current pins
  const count = await prisma.pinnedCard.count({ where: { userId: session.user.id } });
  if (count >= 5) {
    return NextResponse.json({ error: "You can only pin up to 5 cards" }, { status: 400 });
  }

  try {
    const pin = await prisma.pinnedCard.upsert({
      where: { userId_cardId: { userId: session.user.id, cardId } },
      update: {},
      create: { userId: session.user.id, cardId, cardName, setName, cardNumber, imageUrl, tcgioId, rarity, position: count },
    });
    return NextResponse.json({ pin }, { status: 201 });
  } catch (error) {
    console.error("Pin error:", error);
    return NextResponse.json({ error: "Failed to pin card" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { cardId } = await req.json();
  await prisma.pinnedCard.deleteMany({ where: { userId: session.user.id, cardId } });

  // Re-order remaining pins
  const remaining = await prisma.pinnedCard.findMany({
    where: { userId: session.user.id },
    orderBy: { position: "asc" },
  });
  await Promise.all(
    remaining.map((p: { id: string }, i: number) =>
      prisma.pinnedCard.update({ where: { id: p.id }, data: { position: i } })
    )
  );

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Reorder: body = { order: [cardId1, cardId2, ...] }
  const { order } = await req.json();
  if (!Array.isArray(order)) return NextResponse.json({ error: "order must be an array" }, { status: 400 });

  await Promise.all(
    order.map((cardId: string, i: number) =>
      prisma.pinnedCard.updateMany({ where: { userId: session.user!.id!, cardId }, data: { position: i } })
    )
  );
  return NextResponse.json({ success: true });
}
