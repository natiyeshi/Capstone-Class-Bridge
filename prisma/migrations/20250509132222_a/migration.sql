-- AlterTable
ALTER TABLE "GradeLevelMessage" ADD COLUMN     "senderId" TEXT;

-- AddForeignKey
ALTER TABLE "GradeLevelMessage" ADD CONSTRAINT "GradeLevelMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
