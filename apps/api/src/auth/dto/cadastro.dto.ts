import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * DTO DE ENTRADA DO CADASTRO (`POST /auth/cadastro`)
 *
 * Contrato estrito com validações de segurança contra entradas maliciosas.
 */
export class CadastroDto {
  /** Nome completo do aluno. */
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser um texto.' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
  nome: string;

  /** E-mail válido do aluno. */
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @IsEmail({}, { message: 'Forneça um e-mail válido.' })
  @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres.' })
  email: string;

  /**
   * Senha de acesso.
   * Regras de segurança:
   * - Mínimo 8 caracteres
   * - Máximo 72 caracteres (previne ataques de Negação de Serviço/DoS por estouro de CPU no bcrypt)
   * - Pelo menos 1 número
   */
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(8, { message: 'A senha deve ter pelo menos 8 caracteres.' })
  @MaxLength(72, {
    message: 'A senha não pode ter mais do que 72 caracteres.',
  })
  @Matches(/^(?=.*[0-9])/, {
    message: 'A senha deve conter pelo menos um número.',
  })
  senha: string;
}
