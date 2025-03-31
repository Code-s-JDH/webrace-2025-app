import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [
    {
      provide: 'IPrismaClient',
      useClass: PrismaService,
    },
    PrismaService,
  ],
  exports: ['IPrismaClient', PrismaService],
})
export class PrismaModule {}
