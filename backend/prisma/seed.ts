import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
    // 1. Mã hóa mật khẩu cho Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    // 2. Tạo hoặc Cập nhật tài khoản Admin
    console.log('--- Đang tạo tài khoản Admin mẫu ---');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@gmail.com' },
        update: {},
        create: {
            email: 'admin@gmail.com',
            password: adminPassword,
            role: Role.ADMIN,
            profile: {
                create: {
                    fullName: 'Quản trị viên Hệ thống',
                    phone: '0901234567',
                }
            }
        },
    });
    console.log('✅ Đã tạo Admin:', admin.email);
    console.log('--- Hoàn tất seeding ---');
}
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });