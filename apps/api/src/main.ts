import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppConfigService } from './config/app-config.service.js';
import { CONFIG_ERROR } from './config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  app.enableCors({ origin: config.webBaseUrl });

  // 0.0.0.0 é obrigatório dentro de um contêiner: escutar apenas em localhost
  // deixaria a API inalcançável de fora dele.
  await app.listen(config.port, '0.0.0.0');

  console.log(
    `API ouvindo em http://localhost:${config.port} (${config.environment})`,
  );
}

await bootstrap().catch((error: unknown) => {
  // Erro de configuração já vem com mensagem explicando o que fazer. Mostrar a
  // pilha de chamadas junto só enterraria a explicação.
  if (error instanceof Error && error.name === CONFIG_ERROR) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exit(1);
});
