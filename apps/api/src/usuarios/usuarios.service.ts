import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UsuariosRepository } from './usuarios.repository.js';
import { Usuario } from './models/usuario.entity.js';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto.js';

/**
 * SERVICE (Camada de Regras de Negócio)
 *
 * Onde toda a lógica do sistema acontece.
 *
 * O que ESTE ARQUIVO DEVE FAZER:
 * - Aplicar regras de negócio (ex: verificar se o e-mail já existe antes de cadastrar).
 * - Lançar exceções do NestJS (`ConflictException`, `NotFoundException`, etc.) em caso de erro.
 * - Falar com o `UsuariosRepository` para acessar o banco de dados.
 * - Transformar Entidades em DTOs de resposta usando `UsuarioRespostaDto.doModelo()`.
 *
 * O que ESTE ARQUIVO NÃO DEVE FAZER:
 * - Não importar nem manipular elementos de HTTP (`Request`, `Response`, `@Param()`, `@Body()`).
 * - Como não conhece HTTP, pode ser testado instanciando a classe diretamente nos testes unitários,
 *   sem precisar subir nenhum servidor Web!
 */
@Injectable()
export class UsuariosService {
  constructor(private readonly usuariosRepository: UsuariosRepository) {}

  /**
   * Retorna a lista de todos os usuários cadastrados, convertida para DTOs públicos.
   */
  async buscarTodos(): Promise<UsuarioRespostaDto[]> {
    const usuarios = await this.usuariosRepository.buscarTodos();
    return usuarios.map(UsuarioRespostaDto.doModelo);
  }

  /**
   * Busca um usuário pelo ID. Se não encontrar, lança exceção 404 (NotFoundException).
   */
  async buscarPorId(id: string): Promise<UsuarioRespostaDto> {
    const usuario = await this.usuariosRepository.buscarPorId(id);
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return UsuarioRespostaDto.doModelo(usuario);
  }

  /**
   * Cadastra um novo usuário no sistema.
   * Regra de negócio: Impede cadastro duplicado do mesmo e-mail.
   */
  async criar(dto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
    const existe = await this.usuariosRepository.buscarPorEmail(dto.email);
    if (existe) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');
    }

    // Em produção, a senha enviada no DTO deve ser convertida em hash (ex: bcrypt/argon2)
    const senha_hash = dto.senha;

    const novoUsuario = await this.usuariosRepository.criar({
      nome: dto.nome,
      email: dto.email,
      senha_hash,
      email_confirmado_em: new Date(),
    });

    return UsuarioRespostaDto.doModelo(novoUsuario);
  }

  /**
   * Atualiza os dados de um usuário existente.
   * Regra de negócio: Garante que o usuário existe antes de tentar atualizar.
   */
  async atualizar(id: string, data: Partial<Usuario>): Promise<void> {
    await this.buscarPorId(id); // Lança 404 se não existir
    await this.usuariosRepository.atualizar(id, data);
  }

  /**
   * Deleta um usuário do sistema.
   * Regra de negócio: Garante que o usuário existe antes de tentar deletar.
   */
  async deletar(id: string): Promise<void> {
    await this.buscarPorId(id); // Lança 404 se não existir
    await this.usuariosRepository.deletar(id);
  }
}