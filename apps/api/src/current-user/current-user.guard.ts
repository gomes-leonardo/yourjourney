import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from './authenticated-user.js';
import {
  CurrentUserProvider,
  type RequestHeaders,
} from './current-user.provider.js';

export interface RequestWithUser {
  headers: RequestHeaders;
  currentUser?: AuthenticatedUser;
}

@Injectable()
export class CurrentUserGuard implements CanActivate {
  constructor(private readonly provider: CurrentUserProvider) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    request.currentUser = await this.provider.identify(request.headers);

    return true;
  }
}
