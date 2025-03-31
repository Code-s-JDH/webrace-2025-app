import { ClientProxy } from '@nestjs/microservices';

export interface IRabbitMQClient {
  getClient(): ClientProxy;
}
