/*
  Warnings:

  - Made the column `createdAt` on table `GradeLevelMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GradeLevelMessage" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;
