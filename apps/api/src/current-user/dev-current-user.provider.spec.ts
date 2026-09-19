import { CurrentUserProvider } from './current-user.provider.js';
import {
  DEV_STUDENT,
  DevCurrentUserProvider,
} from './dev-current-user.provider.js';

describe('DevCurrentUserProvider', () => {
  const provider: CurrentUserProvider = new DevCurrentUserProvider();

  it('devolve o aluno fixo de desenvolvimento', async () => {
    await expect(provider.identify({})).resolves.toEqual(DEV_STUDENT);
  });

  it('devolve sempre o mesmo aluno, para o que foi criado ser dele na próxima execução', async () => {
    const primeira = await provider.identify({});
    const segunda = await provider.identify({});

    expect(segunda.id).toBe(primeira.id);
  });

  it('não depende da requisição: com ou sem credencial, é o mesmo aluno', async () => {
    const semCredencial = await provider.identify({});
    const comCredencial = await provider.identify({
      authorization: 'Bearer qualquer-coisa',
    });

    expect(comCredencial).toEqual(semCredencial);
  });
});
