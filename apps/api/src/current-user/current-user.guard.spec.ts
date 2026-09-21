import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser } from './authenticated-user.js';
import {
  CurrentUserGuard,
  type RequestWithUser,
} from './current-user.guard.js';
import {
  CurrentUserProvider,
  type RequestHeaders,
} from './current-user.provider.js';

function contextoCom(request: RequestWithUser): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

class ProvedorPeloCabecalho extends CurrentUserProvider {
  identify(headers: RequestHeaders): Promise<AuthenticatedUser> {
    if (headers['x-aluno'] === 'ana') {
      return Promise.resolve({
        id: 'id-da-ana',
        name: 'Ana',
        email: 'ana@email.com',
      });
    }

    return Promise.reject(new UnauthorizedException());
  }
}

describe('CurrentUserGuard', () => {
  const guard = new CurrentUserGuard(new ProvedorPeloCabecalho());

  it('deixa o aluno que o provedor identificou na requisição', async () => {
    const request: RequestWithUser = { headers: { 'x-aluno': 'ana' } };

    await guard.canActivate(contextoCom(request));

    expect(request.currentUser).toEqual({
      id: 'id-da-ana',
      name: 'Ana',
      email: 'ana@email.com',
    });
  });

  it('libera a rota quando o aluno foi identificado', async () => {
    const request: RequestWithUser = { headers: { 'x-aluno': 'ana' } };

    await expect(guard.canActivate(contextoCom(request))).resolves.toBe(true);
  });

  it('barra a rota quando o provedor não reconhece o aluno', async () => {
    const request: RequestWithUser = { headers: {} };

    await expect(guard.canActivate(contextoCom(request))).rejects.toThrow(
      UnauthorizedException,
    );
    expect(request.currentUser).toBeUndefined();
  });
});
