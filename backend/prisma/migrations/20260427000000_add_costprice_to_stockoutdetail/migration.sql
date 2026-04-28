-- AlterTable: add costPrice to StockOutDetail
ALTER TABLE "StockOutDetail" ADD COLUMN "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;
