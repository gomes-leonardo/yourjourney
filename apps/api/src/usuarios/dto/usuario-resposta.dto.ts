import { Usuario } from '../models/usuario.entity.js';

/**
 * DTO DE SAÍDA (O equivalente à View em uma API JSON)
 *
 * Define o formato exato dos dados que a API devolve para o cliente HTTP.
 *
 * O que ESTE ARQUIVO DEVE FAZER:
 * - Garantir segurança: ocultar campos sensíveis (como `senha_hash`).
 * - Fornecer um método estático de conversão (`doModelo`) para transformar a Entidade no DTO.
 *
 * O que ESTE ARQUIVO NÃO DEVE FAZER:
 * - Nunca retornar a Entidade inteira do banco diretamente para o cliente HTTP.
 */
export class UsuarioRespostaDto {
  id: string;
  nome: string;
  email: string;
  plano: string;
  creditos_disponiveis: number;
  email_confirmado_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;

  /**
   * Converte uma Entidade `Usuario` em um DTO `UsuarioRespostaDto` público.
   * Isso evita vazar dados internos (como a senha criptografada).
   */
  static doModelo(usuario: Usuario): UsuarioRespostaDto {
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      plano: usuario.plano,
      creditos_disponiveis: usuario.creditos_disponiveis,
      email_confirmado_em: usuario.email_confirmado_em,
      criado_em: usuario.criado_em,
      atualizado_em: usuario.atualizado_em,
    };
  }
}
