import { z } from 'zod';

/**
 * O contrato das variáveis de environment da API.
 *
 * Toda variável que a aplicação lê precisa estar declarada aqui. Esse é o
 * único lugar onde o formato dela é definido, e é o que permite falhar na
 * subida em vez de quebrar no meio de uma requisição, horas depois.
 */
export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  API_PORT: z.coerce
    .number({ error: 'precisa ser um número, por exemplo 8080' })
    .int()
    .positive()
    .default(8080),

  WEB_BASE_URL: z
    .url({
      error: 'precisa ser uma URL completa, por exemplo http://localhost:3000',
    })
    .default('http://localhost:3000'),

  DATABASE_URL: z
    .string()
    .min(1, {
      error: 'é obrigatória, e o compose já a injeta no contêiner da API',
    })
    .refine(
      (v) => v.startsWith('postgres://') || v.startsWith('postgresql://'),
      {
        error: 'precisa começar com postgres:// ou postgresql://',
      },
    ),
});

export type Env = z.infer<typeof envSchema>;

export const CONFIG_ERROR = 'ErroDeConfiguracao';

/** Variáveis cujo valor nunca pode aparecer em mensagem de error ou log. */
const SECRETS = ['DATABASE_URL'];

/**
 * Valida as variáveis de environment. Chamada pelo NestJS durante a subida.
 *
 * Se algo estiver errado, lança um error listando cada problem. A mensagem
 * nunca inclui o valor da variável, porque algumas carregam password.
 */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);

  if (result.success) {
    return result.data;
  }

  const problems = result.error.issues.map((problem) => {
    const name = String(problem.path[0] ?? '(desconhecida)');
    const received = SECRETS.includes(name)
      ? ''
      : ` Recebido: ${JSON.stringify(raw[name])}.`;

    return `  - ${name}: ${problem.message}.${received}`;
  });

  const error = new Error(
    [
      '',
      'A API não subiu porque a configuração está incorreta.',
      '',
      ...problems,
      '',
      'Confira o seu arquivo .env. Se ele não existe, rode: make setup',
      '',
    ].join('\n'),
  );

  error.name = CONFIG_ERROR;

  throw error;
}
