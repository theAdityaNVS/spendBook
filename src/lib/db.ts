import { PrismaClient } from "@/generated/prisma"

// Prevent multiple Prisma Client instances during Next.js hot reload in dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

// Ensure proper cleanup in serverless functions
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db
}
