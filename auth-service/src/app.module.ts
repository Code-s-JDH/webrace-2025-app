import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, { configValidationSchema } from './bootstrap/config';
import { AuthModule } from '@/modules/auth/auth.module';
import { PrismaModule } from '@/common/infrastructure/prisma/prisma.module';
// import { RedisModule } from '@/common/infrastructure/redis/redis.module';
import { HealthModule } from './modules/health/health.module';
import { RabbitMQModule } from './common/infrastructure/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      envFilePath: [`.env.${process.env.NODE_ENV || 'prod'}`],
    }),
    AuthModule,
    HealthModule,
    PrismaModule,
    RedisModule,
    RabbitMQModule
  ],
})
export class AppModule {}
