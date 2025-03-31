import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { IRabbitMQClient } from '@/common/interfaces/rabbitmq-client.interface';

@Injectable()
export class RabbitMQService implements IRabbitMQClient, OnModuleInit, OnModuleDestroy {
  private client: ClientProxy;
  private readonly rabbitMQUrl: string;
  private readonly queue: string;

  constructor(private readonly configService: ConfigService) {
    this.rabbitMQUrl = this.configService.get<string>('services.rabbitmq.url')!;
    this.queue = this.configService.get<string>('services.rabbitmq.queue')!;
  }

  onModuleInit() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.rabbitMQUrl],
        queue: this.queue,
        queueOptions: { durable: false },
      },
    });
  }

  getClient(): ClientProxy {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.close();
  }
}
