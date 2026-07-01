import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendNewUserNotification, sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);

    // First-ever user becomes ADMIN automatically
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? "ADMIN" : "USER";

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    // Fire emails without blocking the response
    Promise.all([
      sendNewUserNotification({ name: user.name, email: user.email, createdAt: user.createdAt, provider: "Email" }),
      sendWelcomeEmail(user.email, user.name),
    ]).catch(() => {});

    return NextResponse.json({ success: true, userId: user.id, role }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
