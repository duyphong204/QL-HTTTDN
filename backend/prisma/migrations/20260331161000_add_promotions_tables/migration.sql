DO $$
BEGIN
  CREATE TYPE "PromotionType" AS ENUM ('PERCENT', 'FIXED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "Promotion" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "PromotionType" NOT NULL,
  "value" DOUBLE PRECISION NOT NULL,
  "startAt" TIMESTAMP(3),
  "endAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PromotionProduct" (
  "id" TEXT NOT NULL,
  "promotionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,

  CONSTRAINT "PromotionProduct_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PromotionProduct_productId_key" ON "PromotionProduct"("productId");
CREATE UNIQUE INDEX IF NOT EXISTS "PromotionProduct_promotionId_productId_key" ON "PromotionProduct"("promotionId", "productId");
CREATE INDEX IF NOT EXISTS "PromotionProduct_promotionId_idx" ON "PromotionProduct"("promotionId");

DO $$
BEGIN
  ALTER TABLE "PromotionProduct"
  ADD CONSTRAINT "PromotionProduct_promotionId_fkey"
  FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "PromotionProduct"
  ADD CONSTRAINT "PromotionProduct_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
