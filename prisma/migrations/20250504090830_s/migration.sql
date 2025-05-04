/*
  Warnings:

  - A unique constraint covering the columns `[studentId,subjectId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Result_studentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Result_studentId_subjectId_key" ON "Result"("studentId", "subjectId");
