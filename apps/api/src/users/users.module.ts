import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './models/user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';

/**
 * MÓDULO NESTJS DA FUNCIONALIDADE DE USUÁRIOS
 *
 * Agrupa e conecta todas as peças da funcionalidade de usuários.
 *
 * O que ESTE ARQUIVO FAZ:
 * - `imports`: Registra a Entidade `User` no TypeORM com `TypeOrmModule.forFeature([User])`.
 * - `controllers`: Declara os Controllers que respondem pelas rotas HTTP desta funcionalidade.
 * - `providers`: Declara os Services e Repositories disponíveis para injeção de dependência.
 * - `exports`: Exporta o Service e Repository para que OUTROS módulos (ex: materiais, pagamentos)
 *   possam injetá-los quando precisarem consultar dados do usuário.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
