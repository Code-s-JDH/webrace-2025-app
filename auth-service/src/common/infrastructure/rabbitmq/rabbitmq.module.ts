import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  providers: [
    {
      provide: 'IRabbitMQClient',
      useClass: RabbitMQService,
    },
    RabbitMQService,
  ],
  exports: ['IRabbitMQClient', RabbitMQService],
})
export class RabbitMQModule {}
