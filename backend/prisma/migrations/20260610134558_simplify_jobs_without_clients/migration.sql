/*
  Warnings:

  - You are about to drop the column `clientId` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_clientId_fkey";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "clientId",
ADD COLUMN     "customerName" TEXT;

-- DropTable
DROP TABLE "Client";
