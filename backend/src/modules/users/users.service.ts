import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import { CreateUserDto, QueryUsersDto, UpdateUserDto } from './dto/user.dto';
import {
  calculatePaginationSkip,
  buildPaginatedResponse,
} from 'src/common/utils/pagination.helper';

const USER_SAFE_SELECT = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  role: true,
  isActive: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
  profile: {
    select: {
      id: true,
      userId: true,
      fullName: true,
      phone: true,
      address: true,
      avatar: true,
      dateOfBirth: true,
    },
  },
  employee: {
    select: {
      id: true,
      code: true,
      position: true,
    },
  },
});

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Helper: Kiểm tra xem Role có thuộc nhóm nhân viên/quản lý không
   */
  private isEmployeeRole(role: Role): boolean {
    return role !== Role.CUSTOMER;
  }

  /**
   * Helper: Tạo mã nhân viên ngẫu nhiên/duy nhất
   */
  private generateEmployeeCode(): string {
    return `NV${Math.floor(1000 + Math.random() * 9000)}${Date.now().toString().slice(-4)}`;
  }

  private async findUserOrThrow(id: string, includeDeleted = false) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại hoặc đã bị xóa');
    }
    return user;
  }

  async findAll(query: QueryUsersDto) {
    const {
      search,
      role,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive,
    } = query;
    const skip = calculatePaginationSkip(page, limit);

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: role || undefined,
      isActive: typeof isActive === 'boolean' ? isActive : undefined,
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { profile: { fullName: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        select: USER_SAFE_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    return this.findUserOrThrow(id);
  }

  async create(dto: CreateUserDto) {
    const existedUser = await this.findByEmail(dto.email);
    if (existedUser && !existedUser.deletedAt) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const isEmployee = this.isEmployeeRole(dto.role);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        profile: {
          create: { ...dto.profile },
        },
        // Tự động tạo bản ghi Employee nếu không phải CUSTOMER
        ...(isEmployee && {
          employee: {
            create: {
              code: this.generateEmployeeCode(),
              position: dto.role.toString(),
              baseSalary: 0,
              joinDate: new Date(),
            },
          },
        }),
      },
      select: USER_SAFE_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const currentUser = await this.findUserOrThrow(id);

    if (dto.email && dto.email !== currentUser.email) {
      const duplicated = await this.prisma.user.findFirst({
        where: { email: dto.email, deletedAt: null, NOT: { id } },
      });
      if (duplicated) throw new ConflictException('Email đã tồn tại');
    }

    // Xử lý logic Employee khi thay đổi Role
    const updateData: Prisma.UserUpdateInput = {
      email: dto.email,
      role: dto.role,
      profile: dto.profile ? { update: { ...dto.profile } } : undefined,
    };

    // Nếu nâng cấp từ CUSTOMER lên các Role quản lý/nhân viên
    if (dto.role && currentUser.role === Role.CUSTOMER && this.isEmployeeRole(dto.role)) {
      updateData.employee = {
        upsert: {
          create: {
            code: this.generateEmployeeCode(),
            position: dto.role.toString(),
            baseSalary: 0,
            joinDate: new Date(),
          },
          update: {}, // Nếu đã có rồi thì không làm gì
        },
      };
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: USER_SAFE_SELECT,
    });
  }

  async remove(id: string) {
    await this.findUserOrThrow(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      select: USER_SAFE_SELECT,
    });
  }

  async restore(id: string) {
    const user = await this.findUserOrThrow(id, true);

    if (user.deletedAt === null) {
      throw new ConflictException('Người dùng này không bị xóa');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
      select: USER_SAFE_SELECT,
    });
  }

  async updateRole(id: string, role: Role) {
    const currentUser = await this.findUserOrThrow(id);

    const isUpgrading = currentUser.role === Role.CUSTOMER && this.isEmployeeRole(role);

    return this.prisma.user.update({
      where: { id },
      data: {
        role,
        ...(isUpgrading && {
          employee: {
            upsert: {
              create: {
                code: this.generateEmployeeCode(),
                position: role.toString(),
                baseSalary: 0,
              },
              update: {},
            },
          },
        }),
      },
      select: USER_SAFE_SELECT,
    });
  }
}
