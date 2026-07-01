import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Fetch role fresh from DB to ensure it's always current
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  return (
    <DashboardClient
      user={{ ...session.user, role: dbUser?.role ?? "USER" }}
    />
  );
}
