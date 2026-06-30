import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Supports both local SQLite (file:./dev.db) and Turso cloud (libsql://...)
function createPrismaClient() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN; // required for Turso, undefined for local

  const adapter = new PrismaLibSql(
    authToken ? { url, authToken } : { url }
  );
  return new PrismaClient({ adapter } as never);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
