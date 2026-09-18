import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { CadastroDto } from './dto/cadastro.dto.js';
import { EmailService } from './email.service.js';

/**
 * SERVIÇO DE AUTENTICAÇÃO (`AuthService`)
 *
 * Centraliza as regras de negócio de autenticação e cadastro de contas.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Realiza o cadastro de um novo aluno no sistema.
   *
   * Regras de negócio e segurança:
   * 1. Normaliza o e-mail para letras minúsculas (`trim().toLowerCase()`).
   * 2. Recusa cadastro se o e-mail já existir no banco (HTTP 409 Conflict).
   * 3. Gera hash seguro da senha com `bcrypt` (10 salt rounds).
   * 4. Salva o usuário com `email_confirmed_at: null`.
   * 5. Dispara o e-mail de confirmação em background (sem aguardar a resposta HTTP).
   * 6. Devolve `UserResponseDto` (NENHUMA senha ou token JWT é retornado).
   */
  async cadastrar(dto: CadastroDto): Promise<UserResponseDto> {
    const emailNormalizado = dto.email.trim().toLowerCase();

    // 1. Verifica duplicidade de e-mail
    const usuarioExistente =
      await this.usersRepository.findByEmail(emailNormalizado);
    if (usuarioExistente) {
      throw new ConflictException(
        'Já existe um usuário cadastrado com este e-mail.',
      );
    }

    // 2. Hash seguro da senha
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(dto.senha, saltRounds);

    // 3. Persiste a conta no banco de dados com e-mail não confirmado
    const novoUsuario = await this.usersRepository.create({
      name: dto.nome.trim(),
      email: emailNormalizado,
      password_hash,
      email_confirmed_at: null,
    });

    // 4. Gera o código de confirmação e envia o e-mail de forma assíncrona (não-bloqueante)
    const codigoConfirmacao = this.emailService.gerarCodigoConfirmacao();
    void this.emailService.enviarCodigoConfirmacao(
      emailNormalizado,
      codigoConfirmacao,
    );

    // 5. Retorna os dados públicos da conta (sem password_hash e sem token de sessão)
    return UserResponseDto.fromModel(novoUsuario);
  }
}
