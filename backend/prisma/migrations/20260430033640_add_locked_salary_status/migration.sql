-- CreateEnum (skip if already exists)
DO $$ BEGIN
    CREATE TYPE "LeaveType" AS ENUM ('PAID', 'UNPAID', 'SICK', 'MATERNITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterEnum: add LOCKED to SalaryStatus
ALTER TYPE "SalaryStatus" ADD VALUE IF NOT EXISTS 'LOCKED';

-- AlterTable: convert LeaveRequest.type from text to LeaveType enum using USING cast
ALTER TABLE "LeaveRequest"
  ALTER COLUMN "type" TYPE "LeaveType" USING "type"::"LeaveType";

-- DropIndex if exists
DROP INDEX IF EXISTS "PromotionProduct_promotionId_idx";

-- DropTable PaymentTransaction if exists (removed from schema)
DROP TABLE IF EXISTS "PaymentTransaction";
