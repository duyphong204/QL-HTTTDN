/*
  Warnings:

  - You are about to drop the column `amount` on the `Salary` table. All the data in the column will be lost.
  - You are about to drop the column `bonus` on the `Salary` table. All the data in the column will be lost.
  - You are about to drop the column `deduction` on the `Salary` table. All the data in the column will be lost.
  - The `status` column on the `Salary` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[employeeId,month,year]` on the table `Salary` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "DetailType" AS ENUM ('BONUS', 'OT', 'ALLOWANCE', 'DEDUCTION', 'INSURANCE', 'TAX');

-- CreateEnum
CREATE TYPE "SalaryStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LEAVE', 'LATE');

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "baseSalary" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Salary" DROP COLUMN "amount",
DROP COLUMN "bonus",
DROP COLUMN "deduction",
ADD COLUMN     "actualWorkDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "baseSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "grossSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "netSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "totalBonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalDeduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "workingDays" INTEGER NOT NULL DEFAULT 26,
DROP COLUMN "status",
ADD COLUMN     "status" "SalaryStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "SalaryDetail" (
    "id" TEXT NOT NULL,
    "salaryId" TEXT NOT NULL,
    "type" "DetailType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "description" TEXT,

    CONSTRAINT "SalaryDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_employeeId_date_key" ON "Attendance"("employeeId", "date");

-- CreateIndex
CREATE INDEX "Salary_month_year_idx" ON "Salary"("month", "year");

-- CreateIndex
CREATE INDEX "Salary_employeeId_idx" ON "Salary"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "Salary_employeeId_month_year_key" ON "Salary"("employeeId", "month", "year");

-- AddForeignKey
ALTER TABLE "SalaryDetail" ADD CONSTRAINT "SalaryDetail_salaryId_fkey" FOREIGN KEY ("salaryId") REFERENCES "Salary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
