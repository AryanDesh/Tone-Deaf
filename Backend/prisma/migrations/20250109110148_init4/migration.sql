/*
  Warnings:

  - You are about to drop the column `chunked` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "chunked",
DROP COLUMN "images";

-- AlterTable
ALTER TABLE "_PlaylistSongs" ADD CONSTRAINT "_PlaylistSongs_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PlaylistSongs_AB_unique";
