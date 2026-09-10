import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Connected to PostgreSQL successfully via Prisma.');
    } catch (error) {
      this.logger.error('❌ Could not connect to PostgreSQL:', error.message);
      process.exit(1);
    }
  }
}
