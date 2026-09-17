import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO DE ENTRADA (Data Transfer Object)
 *
 * Define o contrato dos dados enviados ao cadastrar um usuário.
 */
export class CriarUsuarioDto {
  /** Nome completo do usuário. */
  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString()
  nome: string;

  /** E-mail do usuário. */
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @IsEmail({}, { message: 'Forneça um e-mail válido.' })
  email: string;

  /** Senha do usuário. */
  @IsNotEmpty({ message: 'A senha é obrigatória.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  senha: string;
}
