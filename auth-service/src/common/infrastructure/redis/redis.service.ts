import { Injectable, OnModuleDestroy, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly client: RedisClientType,
  ) {}

  getClient(): RedisClientType {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.disconnect();
  }
}
