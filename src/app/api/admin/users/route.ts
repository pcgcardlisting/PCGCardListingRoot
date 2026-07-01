import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") return null;
  return session;
}

// GET /api/admin/users — list all users
export async function GET(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const search = req.nextUrl.searchParams.get("q") || "";
  const users = await prisma.user.findMany({
    where: search ? {
      OR: [
        { email: { contains: search } },
        { name: { contains: search } },
      ],
    } : {},
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
      emailVerified: true,
      _count: {
        select: {
          watchlist: true,
          pinnedCards: true,
          listings: true,
          messages: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.listing.count({ where: { isActive: true } }),
    prisma.message.count(),
  ]);

  return NextResponse.json({
    users,
    stats: {
      totalUsers: stats[0],
      totalAdmins: stats[1],
      activeListings: stats[2],
      totalMessages: stats[3],
    },
  });
}

// PATCH /api/admin/users — update a user's role
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, role } = await req.json();
  if (!userId || !["USER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "userId and role (USER|ADMIN) required" }, { status: 400 });
  }
  // Prevent self-demotion
  if (userId === session.user?.id && role === "USER") {
    return NextResponse.json({ error: "Cannot remove your own admin role" }, { status: 400 });
  }
  const updated = await prisma.user.update({ where: { id: userId }, data: { role } });
  return NextResponse.json({ success: true, user: { id: updated.id, role: updated.role } });
}

// DELETE /api/admin/users — delete a user
export async function DELETE(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === session.user?.id) return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
