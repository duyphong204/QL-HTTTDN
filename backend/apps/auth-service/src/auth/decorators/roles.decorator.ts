import { SetMetadata } from '@nestjs/common';
import { Role } from '@app/common/enums/role.enum';

export const Roles = (...roles: Role[]) => {
  return SetMetadata('roles', roles);
};

