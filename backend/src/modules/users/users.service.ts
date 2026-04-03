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
      ...(typeof isActive === 'boolean' ? { isActive } : {}),
      ...(role ? { role } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: 'insensitive' } },
              {
                profile: {
                  fullName: { contains: search, mode: 'insensitive' },
                },
              },
            ],
          }
        : {}),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: {
          [sortBy]: sortOrder,
        },
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
    const user = await this.prisma.user.findFirst({
      where: { id, isActive: true, deletedAt: null },
      select: USER_SAFE_SELECT,
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    return user;
  }

  async create(data: CreateUserDto) {
    const existedUser = await this.findByEmail(data.email);
    if (existedUser && existedUser.deletedAt === null) {
      throw new ConflictException('Email đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        profile: {
          create: {
            fullName: data.profile.fullName,
          },
        },
      },
      select: USER_SAFE_SELECT,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id);

    if (data.email) {
      const duplicated = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          deletedAt: null,
          NOT: { id },
        },
      });
      if (duplicated) {
        throw new ConflictException('Email đã tồn tại');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        role: data.role,
        profile: data.profile
          ? {
              update: {
                fullName: data.profile.fullName,
              },
            }
          : undefined,
      },
      select: USER_SAFE_SELECT,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

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
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: { not: null } },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('Người dùng đã tồn tại hoặc không thể khôi phục');
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
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: USER_SAFE_SELECT,
    });
  }
}
