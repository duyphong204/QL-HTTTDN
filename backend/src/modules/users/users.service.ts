import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, Role } from '@prisma/client';
import {
  CreateUserDto,
  QueryUsersDto,
  UpdateUserDto,
  UserResponseDto,
} from './dto/user.dto';
import {
  calculatePaginationSkip,
  buildPaginatedResponse,
} from 'src/common/utils/pagination.helper';

@Injectable()
export class UsersService {
  private readonly defaultInclude = { profile: true } as const;

  constructor(private prisma: PrismaService) {}

  /**
   * Helper: Tìm user hoặc ném lỗi nếu không thấy
   */
  private async findUserOrThrow(id: string, includeDeleted = false) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: this.defaultInclude,
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại hoặc đã bị xóa');
    }
    return new UserResponseDto(user);
  }

  /**
   * Lấy danh sách người dùng (có phân trang và tìm kiếm)
   */
  async findAll(query: QueryUsersDto) {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive,
    } = query;
    const skip = calculatePaginationSkip(page, limit);

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: Role.CUSTOMER,
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
        include: this.defaultInclude,
      }),
      this.prisma.user.count({ where }),
    ]);

    return buildPaginatedResponse(
      data.map((user) => new UserResponseDto(user)),
      total,
      page,
      limit,
    );
  }

  async findByEmailWithCredentials(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: this.defaultInclude,
    });

    return user ? new UserResponseDto(user) : null;
  }

  async findOne(id: string) {
    return this.findUserOrThrow(id);
  }

  /**
   * Tạo người dùng mới
   */
  async create(dto: CreateUserDto) {
    const existedUser = await this.findByEmail(dto.email);
    if (existedUser && !existedUser.deletedAt) {
      throw new ConflictException('Email đã tồn tại');
    }

    if (dto.role !== Role.CUSTOMER) {
      throw new BadRequestException(
        'Màn quản lý User chỉ tạo tài khoản CUSTOMER',
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role || Role.CUSTOMER,
        profile: {
          create: { ...dto.profile },
        },
      },
      include: this.defaultInclude,
    });

    return new UserResponseDto(user);
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async update(id: string, dto: UpdateUserDto) {
    const currentUser = await this.findUserOrThrow(id);

    if (currentUser.role !== Role.CUSTOMER) {
      throw new BadRequestException(
        'Màn quản lý User chỉ chỉnh sửa tài khoản CUSTOMER',
      );
    }

    // Kiểm tra trùng email nếu có thay đổi email
    if (dto.email && dto.email !== currentUser.email) {
      const duplicated = await this.prisma.user.findFirst({
        where: { email: dto.email, deletedAt: null, NOT: { id } },
      });
      if (duplicated) throw new ConflictException('Email đã tồn tại');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        role: Role.CUSTOMER,
        profile: dto.profile ? { update: { ...dto.profile } } : undefined,
      },
      include: this.defaultInclude,
    });

    return new UserResponseDto(user);
  }

  /**
   * Xóa mềm người dùng
   */
  async remove(id: string) {
    await this.findUserOrThrow(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      include: this.defaultInclude,
    });

    return new UserResponseDto(user);
  }

  /**
   * Khôi phục người dùng đã xóa
   */
  async restore(id: string) {
    const existingUser = await this.findUserOrThrow(id, true);

    if (existingUser.deletedAt === null) {
      throw new ConflictException('Người dùng này không bị xóa');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        isActive: true,
        deletedAt: null,
      },
      include: this.defaultInclude,
    });

    return new UserResponseDto(user);
  }

  /**
   * Cập nhật riêng Role
   */
  async updateRole(id: string, role: Role) {
    await this.findUserOrThrow(id);

    const user = await this.prisma.user.update({
      where: { id },
      data: { role },
      include: this.defaultInclude,
    });

    return new UserResponseDto(user);
  }
}
