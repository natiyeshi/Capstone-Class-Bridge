/*
  Warnings:

  - You are about to drop the column `userId` on the `Calendar` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Calendar" DROP CONSTRAINT "Calendar_userId_fkey";

-- AlterTable
ALTER TABLE "Calendar" DROP COLUMN "userId",
ADD COLUMN     "directorId" TEXT;

-- AddForeignKey
ALTER TABLE "Calendar" ADD CONSTRAINT "Calendar_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Director"("id") ON DELETE SET NULL ON UPDATE CASCADE;
