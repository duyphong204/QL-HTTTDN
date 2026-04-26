import { IsEnum, IsUUID } from 'class-validator';
import { SalaryStatus } from '@prisma/client';

export class ApproveSalaryDto {
  @IsUUID()
  salaryId!: string;

  @IsEnum(SalaryStatus)
  status!: SalaryStatus; // APPROVED | PAID
}
