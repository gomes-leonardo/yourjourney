import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosRepository } from './usuarios.repository.js';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto.js';

@Injectable()
export class UsuariosService {
  constructor(private readonly usuariosRepository: UsuariosRepository) {}

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
   * Regras:
   * 1. Normaliza o e-mail para letras minúsculas e sem espaços nas pontas.
   * 2. Recusa cadastro duplicado de e-mail (ConflictException 409).
   * 3. Gera hash seguro da senha com bcrypt.
   * 4. Define `email_confirmado_em` como `null` até que a confirmação ocorra.
   */
  async criar(dto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
    const emailNormalizado = dto.email.trim().toLowerCase();

    const existe =
      await this.usuariosRepository.buscarPorEmail(emailNormalizado);
    if (existe) {
      throw new ConflictException(
        'Já existe um usuário cadastrado com este e-mail.',
      );
    }

    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(dto.senha, saltRounds);

    const novoUsuario = await this.usuariosRepository.criar({
      nome: dto.nome.trim(),
      email: emailNormalizado,
      senha_hash,
      email_confirmado_em: null,
    });

    return UsuarioRespostaDto.doModelo(novoUsuario);
  }
}
