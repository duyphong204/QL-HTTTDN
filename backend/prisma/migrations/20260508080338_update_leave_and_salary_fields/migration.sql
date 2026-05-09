/*
  Warnings:

  - You are about to drop the column `payrollPeriodId` on the `Salary` table. All the data in the column will be lost.
  - You are about to drop the `PayrollPeriod` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Salary" DROP CONSTRAINT "Salary_payrollPeriodId_fkey";

-- AlterTable
ALTER TABLE "LeaveRequest" ADD COLUMN     "totalDays" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Salary" DROP COLUMN "payrollPeriodId",
ADD COLUMN     "unpaidDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "actualWorkDays" SET DEFAULT 0,
ALTER COLUMN "actualWorkDays" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "PayrollPeriod";
