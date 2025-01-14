-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET DEFAULT '';
