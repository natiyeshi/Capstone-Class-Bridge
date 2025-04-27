-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "isActivated" BOOLEAN NOT NULL DEFAULT false;
