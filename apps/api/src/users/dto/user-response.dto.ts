import { User } from '../models/user.entity.js';

/**
 * DTO DE SAÍDA (O equivalente à View em uma API JSON)
 *
 * Define o formato exato dos dados que a API devolve para o cliente HTTP.
 *
 * O que ESTE ARQUIVO DEVE FAZER:
 * - Garantir segurança: ocultar campos sensíveis (como `password_hash`).
 * - Fornecer um método estático de conversão (`fromModel`) para transformar a Entidade no DTO.
 *
 * O que ESTE ARQUIVO NÃO DEVE FAZER:
 * - Nunca retornar a Entidade inteira do banco diretamente para o cliente HTTP.
 */
export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  plan: string;
  available_credits: number;
  email_confirmed_at: Date | null;
  created_at: Date;
  updated_at: Date;

  /**
   * Converte uma Entidade `User` em um DTO `UserResponseDto` público.
   * Isso evita vazar dados internos (como a senha criptografada).
   */
  static fromModel(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      available_credits: user.available_credits,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
