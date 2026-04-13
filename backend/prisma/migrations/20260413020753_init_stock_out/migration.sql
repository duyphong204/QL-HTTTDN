-- CreateEnum
CREATE TYPE "StockOutStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StockOutType" AS ENUM ('SALE', 'INTERNAL', 'TRANSFER');

-- CreateTable
CREATE TABLE "StockOut" (
    "id" TEXT NOT NULL,
    "orderId" TEXT,
    "type" "StockOutType" NOT NULL,
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "StockOutStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockOut_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockOutDetail" (
    "id" TEXT NOT NULL,
    "stockOutId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "StockOutDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StockOut" ADD CONSTRAINT "StockOut_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOutDetail" ADD CONSTRAINT "StockOutDetail_stockOutId_fkey" FOREIGN KEY ("stockOutId") REFERENCES "StockOut"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOutDetail" ADD CONSTRAINT "StockOutDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
