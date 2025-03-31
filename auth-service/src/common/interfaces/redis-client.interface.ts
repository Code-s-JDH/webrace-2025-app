import Redis from 'ioredis';

export interface IRedisClient {
  getClient(): Redis;
}
