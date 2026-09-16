import { z } from 'zod';

/**
 * O contrato das variáveis de ambiente da API.
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

export const ERRO_DE_CONFIGURACAO = 'ErroDeConfiguracao';

/** Variáveis cujo valor nunca pode aparecer em mensagem de erro ou log. */
const SEGREDOS = ['DATABASE_URL'];

/**
 * Valida as variáveis de ambiente. Chamada pelo NestJS durante a subida.
 *
 * Se algo estiver errado, lança um erro listando cada problema. A mensagem
 * nunca inclui o valor da variável, porque algumas carregam senha.
 */
export function validarEnv(bruto: Record<string, unknown>): Env {
  const resultado = envSchema.safeParse(bruto);

  if (resultado.success) {
    return resultado.data;
  }

  const problemas = resultado.error.issues.map((problema) => {
    const nome = String(problema.path[0] ?? '(desconhecida)');
    const recebido = SEGREDOS.includes(nome)
      ? ''
      : ` Recebido: ${JSON.stringify(bruto[nome])}.`;

    return `  - ${nome}: ${problema.message}.${recebido}`;
  });

  const erro = new Error(
    [
      '',
      'A API não subiu porque a configuração está incorreta.',
      '',
      ...problemas,
      '',
      'Confira o seu arquivo .env. Se ele não existe, rode: make setup',
      '',
    ].join('\n'),
  );

  erro.name = ERRO_DE_CONFIGURACAO;

  throw erro;
}
