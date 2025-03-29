/*
  Warnings:

  - The primary key for the `PlaylistSong` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `SongId` on the `PlaylistSong` table. All the data in the column will be lost.
  - You are about to drop the column `ipAddress` on the `StreamLog` table. All the data in the column will be lost.
  - You are about to drop the `_PlaylistSongs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `songId` to the `PlaylistSong` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `StreamLog` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- DropForeignKey
ALTER TABLE "Playlist" DROP CONSTRAINT "Playlist_userId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistSong" DROP CONSTRAINT "PlaylistSong_SongId_fkey";

-- DropForeignKey
ALTER TABLE "PlaylistSong" DROP CONSTRAINT "PlaylistSong_playlistId_fkey";

-- DropForeignKey
ALTER TABLE "StreamLog" DROP CONSTRAINT "StreamLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnSongs" DROP CONSTRAINT "TagsOnSongs_songId_fkey";

-- DropForeignKey
ALTER TABLE "TagsOnSongs" DROP CONSTRAINT "TagsOnSongs_tagId_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistSongs" DROP CONSTRAINT "_PlaylistSongs_A_fkey";

-- DropForeignKey
ALTER TABLE "_PlaylistSongs" DROP CONSTRAINT "_PlaylistSongs_B_fkey";

-- AlterTable
ALTER TABLE "PlaylistSong" DROP CONSTRAINT "PlaylistSong_pkey",
DROP COLUMN "SongId",
ADD COLUMN     "songId" UUID NOT NULL,
ADD CONSTRAINT "PlaylistSong_pkey" PRIMARY KEY ("playlistId", "songId");

-- AlterTable
ALTER TABLE "StreamLog" DROP COLUMN "ipAddress",
ALTER COLUMN "userId" SET NOT NULL;

-- DropTable
DROP TABLE "_PlaylistSongs";

-- CreateTable
CREATE TABLE "Friendship" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user1Id" UUID NOT NULL,
    "user2Id" UUID NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Friendship_user1Id_idx" ON "Friendship"("user1Id");

-- CreateIndex
CREATE INDEX "Friendship_user2Id_idx" ON "Friendship"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_user1Id_user2Id_key" ON "Friendship"("user1Id", "user2Id");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnSongs" ADD CONSTRAINT "TagsOnSongs_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnSongs" ADD CONSTRAINT "TagsOnSongs_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlist" ADD CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistSong" ADD CONSTRAINT "PlaylistSong_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistSong" ADD CONSTRAINT "PlaylistSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamLog" ADD CONSTRAINT "StreamLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
