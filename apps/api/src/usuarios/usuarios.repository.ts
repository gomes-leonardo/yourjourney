import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './models/usuario.entity.js';

/**
 * REPOSITORY (Camada de Acesso a Dados)
 *
 * É o único caminho autorizado para ler ou escrever na tabela `usuarios` no PostgreSQL.
 *
 * O que ESTE ARQUIVO DEVE FAZER:
 * - Executar consultas, buscas, inserções e atualizações usando o TypeORM.
 * - Encapsular queries específicas do banco para que o Service não precise saber SQL.
 *
 * O que ESTE ARQUIVO NÃO DEVE FAZER:
 * - Ter regras de negócio (ex: não decide se o usuário tem saldo suficiente, só executa a query).
 * - Conhecer detalhes de requisições HTTP (como status code, req/res).
 */
@Injectable()
export class UsuariosRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  /** Retorna todos os usuários cadastrados. */
  async buscarTodos(): Promise<Usuario[]> {
    return this.repository.find();
  }

  /** Busca um usuário pelo seu ID (UUID). Retorna `null` se não encontrar. */
  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  /** Busca um usuário pelo e-mail exato. Útil para validação de duplicidade e login. */
  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  /** Instancia e salva um novo usuário no banco de dados. */
  async criar(data: Partial<Usuario>): Promise<Usuario> {
    const usuario = this.repository.create(data);
    return this.repository.save(usuario);
  }

  /** Atualiza os campos de um usuário existente pelo seu ID. */
  async atualizar(id: string, data: Partial<Usuario>): Promise<void> {
    await this.repository.update(id, data);
  }

  /** Remove o registro do usuário do banco de dados pelo ID. */
  async deletar(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
