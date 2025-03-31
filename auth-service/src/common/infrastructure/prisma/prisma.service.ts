import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { IPrismaClient } from '@/common/interfaces/prisma-client.interface';

@Injectable()
export class PrismaService extends PrismaClient implements IPrismaClient, OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}