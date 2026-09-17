/**
 * DTO DE ENTRADA (Data Transfer Object)
 *
 * Define o contrato dos dados que o cliente (front-end) DEVE enviar ao cadastrar um usuário.
 *
 * O que ESTE ARQUIVO DEVE FAZER:
 * - Declarar apenas os campos que o cliente tem permissão de enviar na requisição HTTP.
 * - Conter as regras/tipos de validação de entrada.
 *
 * O que ESTE ARQUIVO NÃO DEVE FAZER:
 * - Não incluir campos internos do banco de dados gerados pelo servidor (como id, criado_em, creditos_disponiveis).
 */
export class CriarUsuarioDto {
  /** Nome completo do usuário enviado no corpo da requisição. */
  nome: string;

  /** E-mail válido do usuário. */
  email: string;

  /** Senha em texto puro enviada pelo usuário (será convertida em hash pelo Service). */
  senha: string;
}
