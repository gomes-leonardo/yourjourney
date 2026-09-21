import { CONFIG_ERROR } from '../config/env.schema.js';
import { createCurrentUserProvider } from './create-current-user-provider.js';
import { DevCurrentUserProvider } from './dev-current-user.provider.js';

describe('createCurrentUserProvider', () => {
  it('fora de produção, devolve a implementação de desenvolvimento', () => {
    expect(createCurrentUserProvider(false)).toBeInstanceOf(
      DevCurrentUserProvider,
    );
  });

  it('em produção, recusa subir com o aluno fixo de desenvolvimento', () => {
    expect(() => createCurrentUserProvider(true)).toThrow(/usuário atual/);
  });

  it('marca o erro de produção como erro de configuração, para o main mostrar só a mensagem', () => {
    try {
      createCurrentUserProvider(true);
      throw new Error('deveria ter falhado');
    } catch (error) {
      expect((error as Error).name).toBe(CONFIG_ERROR);
    }
  });

  it('diz onde a implementação real entra, para quem lê o erro saber o que fazer', () => {
    expect(() => createCurrentUserProvider(true)).toThrow(
      /CurrentUserProvider/,
    );
  });
});
