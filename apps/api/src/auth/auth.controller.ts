import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { CadastroDto } from './dto/cadastro.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';

/**
 * CONTROLLER DE AUTENTICAÇÃO (`/auth`)
 *
 * Expõe as rotas HTTP relativas a login, cadastro e confirmação de conta.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/cadastro
   *
   * Cria a conta do aluno e dispara o e-mail de confirmação.
   * Não emite sessão/token JWT: o aluno só acessa o sistema após confirmar o e-mail.
   *
   * Proteções de Segurança Aplicadas:
   * - Rate Limiting: Máximo de 10 tentativas por minuto por IP (bloqueia força bruta/DDoS).
   * - ValidationPipe: Valida tipos, proíbe campos não listados (Mass Assignment) e limita tamanho de texto.
   *
   * Códigos de resposta:
   * - 201 Created: Conta criada com sucesso, código enviado por e-mail.
   * - 409 Conflict: E-mail já cadastrado.
   * - 422 Unprocessable Entity: Algum campo fora das regras de validação.
   * - 429 Too Many Requests: Limite de 10 tentativas por minuto excedido.
   */
  @Post('cadastro')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Proteção contra Mass Assignment (remove propriedades extras)
      forbidNonWhitelisted: true, // Rejeita requisições com propriedades extras não declaradas no DTO
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY, // Responde 422 em falhas de validação de campo
    }),
  )
  async cadastrar(@Body() dto: CadastroDto): Promise<UserResponseDto> {
    return this.authService.cadastrar(dto);
  }
}
