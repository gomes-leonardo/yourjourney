import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { EmailService } from './email.service.js';
import { EmailConfirmationModule } from '../email-confirmation/email-confirmation.module.js';
import { UsersModule } from '../users/users.module.js';

/**
 * MÓDULO DE AUTENTICAÇÃO (`AuthModule`)
 *
 * Agrupa o controller de rotas `/auth`, os serviços de regras de negócio e e-mail,
 * e importa o `UsersModule` para acesso ao banco de dados de usuários.
 */
@Module({
  imports: [UsersModule, EmailConfirmationModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService],
  exports: [AuthService, EmailService],
})
export class AuthModule {}
