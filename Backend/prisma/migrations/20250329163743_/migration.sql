/*
  Warnings:

  - You are about to drop the column `user1Id` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `Friendship` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[followingId,followerId]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `followerId` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `followingId` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_user2Id_fkey";

-- DropIndex
DROP INDEX "Friendship_user1Id_idx";

-- DropIndex
DROP INDEX "Friendship_user1Id_user2Id_key";

-- DropIndex
DROP INDEX "Friendship_user2Id_idx";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "user1Id",
DROP COLUMN "user2Id",
ADD COLUMN     "followerId" UUID NOT NULL,
ADD COLUMN     "followingId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "Friendship_followingId_idx" ON "Friendship"("followingId");

-- CreateIndex
CREATE INDEX "Friendship_followerId_idx" ON "Friendship"("followerId");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_followingId_followerId_key" ON "Friendship"("followingId", "followerId");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
