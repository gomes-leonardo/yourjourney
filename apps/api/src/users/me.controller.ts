import { Controller, Get, UseGuards } from '@nestjs/common';
import type { AuthenticatedUser } from '../current-user/authenticated-user.js';
import { CurrentUser } from '../current-user/current-user.decorator.js';
import { CurrentUserGuard } from '../current-user/current-user.guard.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { UsersService } from './users.service.js';

@Controller('me')
@UseGuards(CurrentUserGuard)
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.usersService.findById(user.id);
  }
}
