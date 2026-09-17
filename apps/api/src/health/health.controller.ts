import { Controller, Get } from '@nestjs/common';
import { HealthResponseDto } from './dto/health-response.dto.js';
import { HealthService } from './health.service.js';

/**
 * Recebe a requisição e devolve a resposta. Nada mais.
 *
 * Se aparecer um `if` de regra de negócio aqui, ele está no lugar errado e
 * pertence ao service.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  check(): HealthResponseDto {
    return this.healthService.check();
  }
}
