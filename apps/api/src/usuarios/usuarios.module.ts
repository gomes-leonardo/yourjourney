import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Usuario } from './models/usuario.entity.js';
import { UsuariosController } from './usuarios.controller.js';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosRepository } from './usuarios.repository.js';

/**
 * MÓDULO NESTJS DA FUNCIONALIDADE DE USUÁRIOS
 *
 * Agrupa e conecta todas as peças da funcionalidade de usuários.
 *
 * O que ESTE ARQUIVO FAZ:
 * - `imports`: Registra a Entidade `Usuario` no TypeORM com `TypeOrmModule.forFeature([Usuario])`.
 * - `controllers`: Declara os Controllers que respondem pelas rotas HTTP desta funcionalidade.
 * - `providers`: Declara os Services e Repositories disponíveis para injeção de dependência.
 * - `exports`: Exporta o Service e Repository para que OUTROS módulos (ex: materiais, pagamentos)
 *   possam injetá-los quando precisarem consultar dados do usuário.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsuariosController],
  providers: [UsuariosService, UsuariosRepository],
  exports: [UsuariosService, UsuariosRepository],
})
export class UsuariosModule {}
