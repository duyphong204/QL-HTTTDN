-- CreateEnum
CREATE TYPE "StockInStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "StockIn" ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "status" "StockInStatus" NOT NULL DEFAULT 'PENDING';
