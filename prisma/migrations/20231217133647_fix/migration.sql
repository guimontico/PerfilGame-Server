-- DropForeignKey
ALTER TABLE "Game" DROP CONSTRAINT "Game_userId_fkey";

-- CreateIndex
CREATE INDEX "Game_userId_idx" ON "Game"("userId");
