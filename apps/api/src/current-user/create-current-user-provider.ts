import { CONFIG_ERROR } from '../config/env.schema.js';
import { CurrentUserProvider } from './current-user.provider.js';
import { DevCurrentUserProvider } from './dev-current-user.provider.js';

export function createCurrentUserProvider(
  isProduction: boolean,
): CurrentUserProvider {
  if (isProduction) {
    const error = new Error(
      [
        '',
        'A API não subiu: não existe implementação real de "usuário atual".',
        '',
        'Em produção a API não pode usar o aluno fixo de desenvolvimento, porque',
        'qualquer requisição seria tratada como esse aluno.',
        '',
        'Para resolver, crie uma classe que estenda CurrentUserProvider e valide o',
        'token do serviço externo de autenticação, e devolva ela em',
        'createCurrentUserProvider (apps/api/src/current-user).',
        '',
      ].join('\n'),
    );

    error.name = CONFIG_ERROR;

    throw error;
  }

  return new DevCurrentUserProvider();
}
