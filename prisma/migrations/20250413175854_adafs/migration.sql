/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `CollectiveResult` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CollectiveResult" ADD COLUMN     "totalScore" DOUBLE PRECISION DEFAULT 0.0;

-- CreateIndex
CREATE UNIQUE INDEX "CollectiveResult_studentId_key" ON "CollectiveResult"("studentId");
