import { describe, it, expect, vi } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { AuthenticatedUser } from '../current-user/authenticated-user.js';
import {
  CurrentUserGuard,
  type RequestWithUser,
} from '../current-user/current-user.guard.js';
import {
  CurrentUserProvider,
  type RequestHeaders,
} from '../current-user/current-user.provider.js';
import { MeController } from './me.controller.js';
import { User } from './models/user.entity.js';
import { UsersRepository } from './users.repository.js';
import { UsersService } from './users.service.js';

const ANA: User = {
  id: 'id-da-ana',
  name: 'Ana',
  email: 'ana@email.com',
  password_hash: 'hash-secreto',
  plan: 'gratuito',
  available_credits: 10,
  email_confirmed_at: null,
  created_at: new Date('2026-09-01T00:00:00Z'),
  updated_at: new Date('2026-09-01T00:00:00Z'),
};

function contextoCom(request: RequestWithUser): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

class ProvedorPeloCabecalho extends CurrentUserProvider {
  identify(headers: RequestHeaders): Promise<AuthenticatedUser> {
    if (headers.authorization === 'Bearer token-da-ana') {
      return Promise.resolve({ id: ANA.id, name: ANA.name, email: ANA.email });
    }

    return Promise.reject(new UnauthorizedException());
  }
}

async function getMe(headers: RequestHeaders) {
  const repository = {
    findById: vi.fn().mockResolvedValue(ANA),
  } as unknown as UsersRepository;
  const controller = new MeController(new UsersService(repository));
  const guard = new CurrentUserGuard(new ProvedorPeloCabecalho());
  const request: RequestWithUser = { headers };

  const resposta = guard
    .canActivate(contextoCom(request))
    .then(() => controller.me(request.currentUser!));

  return { resposta, repository };
}

describe('GET /me', () => {
  it('devolve o perfil público do aluno autenticado', async () => {
    const { resposta, repository } = await getMe({
      authorization: 'Bearer token-da-ana',
    });

    await expect(resposta).resolves.toEqual({
      id: ANA.id,
      name: ANA.name,
      email: ANA.email,
      plan: ANA.plan,
      available_credits: ANA.available_credits,
      email_confirmed_at: null,
      created_at: ANA.created_at,
      updated_at: ANA.updated_at,
    });
    expect(repository.findById).toHaveBeenCalledWith(ANA.id);
  });

  it('nunca inclui o hash da senha na resposta', async () => {
    const { resposta } = await getMe({ authorization: 'Bearer token-da-ana' });

    expect(await resposta).not.toHaveProperty('password_hash');
  });

  it('sem autenticação, responde 401 e nem consulta o banco', async () => {
    const { resposta, repository } = await getMe({});

    await expect(resposta).rejects.toThrow(UnauthorizedException);
    expect(repository.findById).not.toHaveBeenCalled();
  });
});
