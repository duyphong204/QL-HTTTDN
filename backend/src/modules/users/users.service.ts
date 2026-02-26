import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { Role } from 'src/common/enums/role.enum';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async findAll() {
    return this.prisma.user.findMany({
      include: { profile: true },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(data: CreateUserDto) {
    const existedUser = await this.findByEmail(data.email);
    if (existedUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        profile: {
          create: {
            fullName: data.fullName,
          },
        },
      },
      include: { profile: true },
    });
  }
  async update(id: string, data: UpdateUserDto) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        role: data.role,
        profile: data.fullName
          ? {
              update: {
                fullName: data.fullName,
              },
            }
          : undefined,
      },
      include: { profile: true },
    });
  }
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }
  async updateRole(id: string, role: Role) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }
}
