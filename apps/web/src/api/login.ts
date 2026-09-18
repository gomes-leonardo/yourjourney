export async function login(email: string, senha: string) {
  if (email === 'erro401@teste.com') {
    return {
      status: 401,
    };
  }

  if (email === 'erro403@teste.com') {
    return {
      status: 403,
      message: 'Confirme seu e-mail para continuar.',
    };
  }

  if (email === 'erro500@teste.com') {
    return {
      status: 500,
    };
  }

  return {
    status: 200 as const,
    token: 'token-teste',
  };
}