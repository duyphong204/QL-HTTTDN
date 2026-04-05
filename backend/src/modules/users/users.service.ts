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
});

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
        orderBy: { [sortBy]: sortOrder },
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

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        profile: {
          create: {
            ...dto.profile,
          },
        },
      },
      select: USER_SAFE_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findUserOrThrow(id); // Kiểm tra tồn tại

    if (dto.email) {
      const duplicated = await this.prisma.user.findFirst({
        where: { email: dto.email, deletedAt: null, NOT: { id } },
      });
      if (duplicated) throw new ConflictException('Email đã tồn tại');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        role: dto.role,
        ...(dto.profile && {
          profile: {
            update: { ...dto.profile }, // Update linh hoạt mọi trường profile
          },
        }),
      },
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
    // Phải dùng includeDeleted = true để tìm được user đã xóa
    const user = await this.findUserOrThrow(id, true);

    if (user.deletedAt === null) {
      throw new ConflictException(
        'Người dùng này không bị xóa, không cần khôi phục',
      );
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
    await this.findUserOrThrow(id);

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: USER_SAFE_SELECT,
    });
  }
}
