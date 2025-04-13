/*
  Warnings:

  - A unique constraint covering the columns `[sectionId]` on the table `Roaster` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Roaster_sectionId_key" ON "Roaster"("sectionId");
