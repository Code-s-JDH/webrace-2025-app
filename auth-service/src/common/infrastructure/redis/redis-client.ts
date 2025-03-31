// import { createClient, RedisClientType } from 'redis';
// import { ConfigService } from '@nestjs/config';

// export const createRedisClient = async (configService: ConfigService): Promise<RedisClientType> => {
//   const redisClient = createClient({
//     url: `redis://${configService.get('services.redis.host')}:${configService.get('services.redis.port')}`,
//   });

//   redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));
//   redisClient.on('connect', () => console.log('✅ Redis Client Connected'));

//   await redisClient.connect();

//   return redisClient;
// };
