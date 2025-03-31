import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Získá stav systému' })
  @ApiResponse({
    status: 200,
    description: 'Vrací stav serveru, databáze a cache',
    schema: { example: { server: true, database: true, cache: true } },
  })
  async checkHealth() {
    const status = await this.healthService.checkHealth();
    return status;
  }
}
