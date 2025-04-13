/*
  Warnings:

  - You are about to drop the `MarketCap` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trending` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "MarketCap";

-- DropTable
DROP TABLE "Trending";
