import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from './authenticated-user.js';
import { CurrentUserProvider } from './current-user.provider.js';

export const DEV_STUDENT: AuthenticatedUser = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Aluno de Desenvolvimento',
  email: 'aluno.dev@yourjourney.local',
};

@Injectable()
export class DevCurrentUserProvider extends CurrentUserProvider {
  identify(): Promise<AuthenticatedUser> {
    return Promise.resolve(DEV_STUDENT);
  }
}
