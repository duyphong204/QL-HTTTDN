-- Apply pending: add LOCKED to SalaryStatus (idempotent, already in prior migration)
-- handled by 20260430033640

-- Rename PAID -> ANNUAL in LeaveType enum
ALTER TYPE "LeaveType" RENAME VALUE 'PAID' TO 'ANNUAL';

-- Add RESIGNATION to LeaveType enum
ALTER TYPE "LeaveType" ADD VALUE IF NOT EXISTS 'RESIGNATION';
