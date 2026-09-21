import { CONFIG_ERROR, validateEnv } from './env.schema.js';

const ENV_VALIDO = {
  NODE_ENV: 'test',
  API_PORT: '8080',
  WEB_BASE_URL: 'http://localhost:3000',
  DATABASE_URL: 'postgres://usuario:senha@localhost:5432/banco',
};

describe('validateEnv', () => {
  it('converte a porta de texto para número', () => {
    expect(validateEnv(ENV_VALIDO).API_PORT).toBe(8080);
  });

  it('aplica os padrões quando a variável opcional não vem', () => {
    const { DATABASE_URL } = ENV_VALIDO;

    const env = validateEnv({ DATABASE_URL });

    expect(env.API_PORT).toBe(8080);
    expect(env.NODE_ENV).toBe('development');
    expect(env.WEB_BASE_URL).toBe('http://localhost:3000');
  });

  it('usa 10 minutos e 5 tentativas para o código de confirmação quando não vêm', () => {
    const { DATABASE_URL } = ENV_VALIDO;

    const env = validateEnv({ DATABASE_URL });

    expect(env.CONFIRMATION_CODE_TTL_MINUTES).toBe(10);
    expect(env.CONFIRMATION_CODE_MAX_ATTEMPTS).toBe(5);
  });

  it('converte a validade e o limite de tentativas de texto para número', () => {
    const env = validateEnv({
      ...ENV_VALIDO,
      CONFIRMATION_CODE_TTL_MINUTES: '15',
      CONFIRMATION_CODE_MAX_ATTEMPTS: '3',
    });

    expect(env.CONFIRMATION_CODE_TTL_MINUTES).toBe(15);
    expect(env.CONFIRMATION_CODE_MAX_ATTEMPTS).toBe(3);
  });

  it('recusa validade ou limite de tentativas zerados ou que não são número', () => {
    expect(() =>
      validateEnv({ ...ENV_VALIDO, CONFIRMATION_CODE_TTL_MINUTES: '0' }),
    ).toThrow(/CONFIRMATION_CODE_TTL_MINUTES/);
    expect(() =>
      validateEnv({ ...ENV_VALIDO, CONFIRMATION_CODE_MAX_ATTEMPTS: 'cinco' }),
    ).toThrow(/CONFIRMATION_CODE_MAX_ATTEMPTS/);
  });

  it('recusa subir sem DATABASE_URL, dizendo qual variável falta', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });

  it('recusa DATABASE_URL que não é de Postgres', () => {
    expect(() =>
      validateEnv({ ...ENV_VALIDO, DATABASE_URL: 'mysql://u:s@localhost/b' }),
    ).toThrow(/DATABASE_URL/);
  });

  it('recusa porta que não é número', () => {
    expect(() => validateEnv({ ...ENV_VALIDO, API_PORT: 'oitenta' })).toThrow(
      /API_PORT/,
    );
  });

  it('recusa endereço do front que não é URL', () => {
    expect(() =>
      validateEnv({ ...ENV_VALIDO, WEB_BASE_URL: 'localhost' }),
    ).toThrow(/WEB_BASE_URL/);
  });

  it('nunca mostra o valor de uma variável secreta na mensagem de erro', () => {
    const segredo = 'postgres-com-senha-super-secreta-123';

    try {
      validateEnv({ ...ENV_VALIDO, DATABASE_URL: segredo });
      throw new Error('deveria ter falhado');
    } catch (error) {
      expect((error as Error).message).not.toContain(segredo);
      expect((error as Error).message).toContain('DATABASE_URL');
    }
  });

  it('mostra o valor recebido de variável que não é segredo, para ajudar a achar o erro', () => {
    try {
      validateEnv({ ...ENV_VALIDO, API_PORT: 'oitenta' });
      throw new Error('deveria ter falhado');
    } catch (error) {
      expect((error as Error).message).toContain('oitenta');
    }
  });

  it('marca o erro para o main saber que é configuração e não mostrar a pilha', () => {
    try {
      validateEnv({});
      throw new Error('deveria ter falhado');
    } catch (error) {
      expect((error as Error).name).toBe(CONFIG_ERROR);
    }
  });

  it('junta todos os problemas numa mensagem só, em vez de reclamar de um por vez', () => {
    try {
      validateEnv({ API_PORT: 'oitenta', WEB_BASE_URL: 'localhost' });
      throw new Error('deveria ter falhado');
    } catch (error) {
      const mensagem = (error as Error).message;

      expect(mensagem).toContain('API_PORT');
      expect(mensagem).toContain('WEB_BASE_URL');
      expect(mensagem).toContain('DATABASE_URL');
    }
  });
});
