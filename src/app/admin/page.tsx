import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();

  // Server-side admin gate
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") redirect("/dashboard");

  return <AdminClient currentUserId={session.user.id} />;
}
