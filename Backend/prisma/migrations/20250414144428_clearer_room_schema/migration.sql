/*
  Warnings:

  - You are about to drop the column `socketId` on the `Room` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[room]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `room` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserInRoom" DROP CONSTRAINT "UserInRoom_roomId_fkey";

-- DropForeignKey
ALTER TABLE "UserInRoom" DROP CONSTRAINT "UserInRoom_userId_fkey";

-- DropIndex
DROP INDEX "Room_socketId_key";

-- AlterTable
ALTER TABLE "Room" DROP COLUMN "socketId",
ADD COLUMN     "room" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_room_key" ON "Room"("room");

-- AddForeignKey
ALTER TABLE "UserInRoom" ADD CONSTRAINT "UserInRoom_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInRoom" ADD CONSTRAINT "UserInRoom_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
