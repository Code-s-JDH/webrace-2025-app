import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaModule } from '@/common/infrastructure/prisma/prisma.module';
// import { RedisModule } from '@/common/infrastructure/redis/redis.module';
import { RabbitMQModule } from '@/common/infrastructure/rabbitmq/rabbitmq.module';

@Module({
  // imports: [PrismaModule, RedisModule, RabbitMQModule],
  imports: [PrismaModule, RabbitMQModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
