/*
  Warnings:

  - You are about to drop the column `fileLoc` on the `Song` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Song_fileLoc_key";

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "fileLoc";
