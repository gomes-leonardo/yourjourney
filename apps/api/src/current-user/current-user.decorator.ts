import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import type { AuthenticatedUser } from './authenticated-user.js';
import type { RequestWithUser } from './current-user.guard.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    if (!request.currentUser) {
      throw new InternalServerErrorException(
        'Rota usa @CurrentUser() sem @UseGuards(CurrentUserGuard).',
      );
    }

    return request.currentUser;
  },
);
