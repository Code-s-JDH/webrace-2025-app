import * as Joi from 'joi';

export default () => ({
  type: process.env.NODE_ENV || 'dev',
  server: {
    port: 4100,
    host: '0.0.0.0',
  },
  services: {
    apiService: {
      host: 'api-service',
      port: 4000,
    },
    redis: {
      host: 'redis',
      port: 6379,
    },
    rabbitmq: {
      url: 'amqp://rabbitmq:5672',
      queue: 'auth_queue',
    },
  },
});

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('dev', 'prod').default('dev'),
  PORT: Joi.number().default(4100),
  HOST: Joi.string().default('0.0.0.0'),
  API_SERVICE_HOST: Joi.string().default('api-service'),
  API_SERVICE_PORT: Joi.string().default('4000'),
  REDIS_HOST: Joi.string().default('redis'),
  REDIS_PORT: Joi.string().default('6379'),
  RABBITMQ_URL: Joi.string().default('amqp://rabbitmq:5672'),
  RABBITMQ_QUEUE: Joi.string().default('auth_queue'),
});
