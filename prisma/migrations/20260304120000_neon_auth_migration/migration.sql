/*
  Warnings:

  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT IF EXISTS "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT IF EXISTS "sessions_userId_fkey";

-- DropTable
DROP TABLE IF EXISTS "accounts";

-- DropTable
DROP TABLE IF EXISTS "sessions";

-- DropTable
DROP TABLE IF EXISTS "verification_tokens";

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "password";

-- AddColumn
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "neon_auth_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_neon_auth_id_key" ON "users"("neon_auth_id");
