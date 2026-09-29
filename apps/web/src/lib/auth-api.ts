export type CadastroPayload = {
  nome: string;
  email: string;
  senha: string;
};

export type ErroCadastro = {
  field?: string;
  path?: string[];
  message?: string;
};

export type RespostaCadastro = {
  status: 201 | 409 | 422 | 500;
  message?: string;
  errors?: ErroCadastro[];
};

/**
 * Adaptador temporário do cadastro.
 *
 * Este é o único arquivo que conhece o mock. Quando a issue #13 criar o
 * endpoint real, substitua o corpo desta função por um fetch para
 * /auth/cadastro, sem alterar a tela ou o contrato abaixo.
 *
 * E-mails para testar os cenários:
 * - cadastrado@exemplo.com -> 409
 * - invalido-servidor@exemplo.com -> 422
 * - erro-servidor@exemplo.com -> 500
 * - rede-caida@exemplo.com -> falha de rede
 */
export async function cadastrar(
  payload: CadastroPayload,
): Promise<RespostaCadastro> {
  await new Promise((resolve) => window.setTimeout(resolve, 700));

  switch (payload.email.toLowerCase()) {
    case 'cadastrado@exemplo.com':
      return {
        status: 409,
        message: 'Este e-mail já está cadastrado.',
      };
    case 'invalido-servidor@exemplo.com':
      return {
        status: 422,
        errors: [
          {
            field: 'email',
            message: 'O servidor recusou este e-mail.',
          },
        ],
      };
    case 'erro-servidor@exemplo.com':
      return {
        status: 500,
        message: 'Serviço temporariamente indisponível.',
      };
    case 'rede-caida@exemplo.com':
      throw new Error('Falha de rede simulada.');
    default:
      return { status: 201 };
  }
}
