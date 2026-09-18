import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module.js';
import { AppConfigService } from './config/app-config.service.js';
import { CONFIG_ERROR } from './config/env.schema.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(AppConfigService);

  // Proteção contra ataques de tamanho de payload (Negação de Serviço / DoS por memória)
  // Limita o tamanho do JSON e formulários a no máximo 100kb por requisição.
  app.use(json({ limit: '100kb' }));
  app.use(urlencoded({ extended: true, limit: '100kb' }));

  // Política Estrita de CORS (Cross-Origin Resource Sharing)
  // O backend confia e aceita requisições EXCLUSIVAMENTE originadas do frontend (`WEB_BASE_URL`).
  app.enableCors({
    origin: config.webBaseUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // Permite o envio seguro de cookies HttpOnly entre o frontend e a API
    maxAge: 86400, // Cache das requisições de verificação preflight (OPTIONS) por 24 horas
  });

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
