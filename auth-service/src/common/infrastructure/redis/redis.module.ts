// import { Module } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { RedisService } from './redis.service';
// import createRedisClient

// @Module({
//   imports: [ConfigModule],
//   providers: [
//     {
//       provide: 'REDIS_CLIENT',
//       inject: [ConfigService],
//       useFactory: async (configService: ConfigService) =
// createRedisClient(configService),
//     },
//     RedisService,
//   ],
//   exports: [RedisService],
// })
// export class RedisModule {}
