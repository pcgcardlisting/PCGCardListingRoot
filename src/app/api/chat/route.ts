import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/chat?listingId=xxx — get or create a chat room, return messages
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const listingId = req.nextUrl.searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  // Get the listing to know the seller
  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  // Seller uses buyerId = their own id to see all rooms for their listing
  let room;
  if (listing.userId === session.user.id) {
    // Seller: get all rooms for this listing
    const rooms = await prisma.chatRoom.findMany({
      where: { listingId },
      include: {
        buyer: { select: { id: true, name: true, image: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ rooms, isSeller: true });
  }

  // Buyer: get or create their room
  room = await prisma.chatRoom.upsert({
    where: { listingId_buyerId: { listingId, buyerId: session.user.id } },
    update: {},
    create: { listingId, buyerId: session.user.id },
    include: {
      buyer: { select: { id: true, name: true, image: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { sender: { select: { id: true, name: true } } } },
    },
  });
  return NextResponse.json({ room, isSeller: false, sellerId: listing.userId });
}

// POST /api/chat — send a message
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { roomId, content } = await req.json();
  if (!roomId || !content?.trim()) return NextResponse.json({ error: "roomId and content required" }, { status: 400 });

  // Verify user is part of this room
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { listing: { select: { userId: true } } },
  });
  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  const isParticipant = room.buyerId === session.user.id || room.listing.userId === session.user.id;
  if (!isParticipant) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const message = await prisma.message.create({
    data: { roomId, senderId: session.user.id, content: content.trim() },
    include: { sender: { select: { id: true, name: true } } },
  });
  return NextResponse.json({ message }, { status: 201 });
}
