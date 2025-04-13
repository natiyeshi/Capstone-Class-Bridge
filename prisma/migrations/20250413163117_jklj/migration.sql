/*
  Warnings:

  - You are about to drop the column `conduct` on the `Result` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CollectiveResult" ADD COLUMN     "conduct" "Conduct";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "conduct";
