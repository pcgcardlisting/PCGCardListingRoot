import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/chat/rooms — get all chat rooms the current user participates in
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [buyerRooms, sellerRooms] = await Promise.all([
    prisma.chatRoom.findMany({
      where: { buyerId: session.user.id },
      include: {
        listing: { select: { cardName: true, imageUrl: true, listingType: true, price: true, userId: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.chatRoom.findMany({
      where: { listing: { userId: session.user.id } },
      include: {
        listing: { select: { cardName: true, imageUrl: true, listingType: true, price: true, userId: true } },
        buyer: { select: { id: true, name: true, image: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ buyerRooms, sellerRooms });
}
