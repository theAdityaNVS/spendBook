-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "user_families_userId_idx" ON "user_families"("userId");

-- CreateIndex
CREATE INDEX "user_families_familyId_idx" ON "user_families"("familyId");
