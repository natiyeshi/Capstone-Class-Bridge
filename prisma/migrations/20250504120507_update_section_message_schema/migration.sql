/*
  Warnings:

  - You are about to drop the column `image` on the `SectionMessage` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `SectionMessage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "SectionMessage" DROP CONSTRAINT "SectionMessage_userId_fkey";

-- AlterTable
ALTER TABLE "SectionMessage" DROP COLUMN "image",
DROP COLUMN "userId",
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "senderId" TEXT;

-- AddForeignKey
ALTER TABLE "SectionMessage" ADD CONSTRAINT "SectionMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
