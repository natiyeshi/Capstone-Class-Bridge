-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
