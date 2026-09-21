import type { AuthenticatedUser } from './authenticated-user.js';

export type RequestHeaders = Record<string, string | string[] | undefined>;

export abstract class CurrentUserProvider {
  // Devolve o aluno da requisição, ou lança UnauthorizedException se não o reconhecer.
  abstract identify(headers: RequestHeaders): Promise<AuthenticatedUser>;
}
