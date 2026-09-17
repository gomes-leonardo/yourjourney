import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Env } from './env.schema.js';

/**
 * O único lugar da aplicação que conhece variável de environment.
 *
 * Nenhum outro arquivo deve ler `process.env`. Quem precisa de configuração
 * injeta este serviço e usa os campos abaixo, que já vêm com o tipo certo.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  get environment(): Env['NODE_ENV'] {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.environment === 'production';
  }

  get port(): number {
    return this.config.get('API_PORT', { infer: true });
  }

  get webBaseUrl(): string {
    return this.config.get('WEB_BASE_URL', { infer: true });
  }

  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }
}
