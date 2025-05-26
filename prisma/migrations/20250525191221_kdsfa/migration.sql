/*
  Warnings:

  - A unique constraint covering the columns `[sectionId,studentId,semesterNumber]` on the table `Roaster` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `average` to the `Roaster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rank` to the `Roaster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterNumber` to the `Roaster` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentId` to the `Roaster` table without a default value. This is not possible if the table is not empty.
  - Made the column `sectionId` on table `Roaster` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CollectiveResult" DROP CONSTRAINT "CollectiveResult_roasterId_fkey";

-- DropForeignKey
ALTER TABLE "Roaster" DROP CONSTRAINT "Roaster_sectionId_fkey";

-- DropIndex
DROP INDEX "Roaster_sectionId_key";

-- AlterTable
ALTER TABLE "Roaster" ADD COLUMN     "average" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rank" INTEGER NOT NULL,
ADD COLUMN     "semesterNumber" INTEGER NOT NULL,
ADD COLUMN     "studentId" TEXT NOT NULL,
ALTER COLUMN "sectionId" SET NOT NULL;

-- CreateTable
CREATE TABLE "RoasterSubject" (
    "id" TEXT NOT NULL,
    "roasterId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "subjectResult" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RoasterSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoasterSubject_id_key" ON "RoasterSubject"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RoasterSubject_roasterId_subjectName_key" ON "RoasterSubject"("roasterId", "subjectName");

-- CreateIndex
CREATE UNIQUE INDEX "Roaster_sectionId_studentId_semesterNumber_key" ON "Roaster"("sectionId", "studentId", "semesterNumber");

-- AddForeignKey
ALTER TABLE "Roaster" ADD CONSTRAINT "Roaster_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roaster" ADD CONSTRAINT "Roaster_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoasterSubject" ADD CONSTRAINT "RoasterSubject_roasterId_fkey" FOREIGN KEY ("roasterId") REFERENCES "Roaster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
