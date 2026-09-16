import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { AppConfigService } from './config/app-config.service.js';
import { ERRO_DE_CONFIGURACAO } from './config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  app.enableCors({ origin: config.urlDoFront });

  // 0.0.0.0 é obrigatório dentro de um contêiner: escutar apenas em localhost
  // deixaria a API inalcançável de fora dele.
  await app.listen(config.porta, '0.0.0.0');

  console.log(
    `API ouvindo em http://localhost:${config.porta} (${config.ambiente})`,
  );
}

await bootstrap().catch((erro: unknown) => {
  // Erro de configuração já vem com mensagem explicando o que fazer. Mostrar a
  // pilha de chamadas junto só enterraria a explicação.
  if (erro instanceof Error && erro.name === ERRO_DE_CONFIGURACAO) {
    console.error(erro.message);
  } else {
    console.error(erro);
  }

  process.exit(1);
});
