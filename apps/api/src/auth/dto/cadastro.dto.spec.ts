import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { CadastroDto } from './cadastro.dto.js';

describe('CadastroDto', () => {
  it('deve aprovar DTO válido', async () => {
    const dto = new CadastroDto();
    dto.nome = 'Aluno Teste';
    dto.email = 'aluno@email.com';
    dto.senha = 'senhaSegura123';

    const erros = await validate(dto);
    expect(erros.length).toBe(0);
  });

  it('deve rejeitar e-mail inválido', async () => {
    const dto = new CadastroDto();
    dto.nome = 'Aluno Teste';
    dto.email = 'email-invalido';
    dto.senha = 'senhaSegura123';

    const erros = await validate(dto);
    expect(erros.length).toBeGreaterThan(0);
    expect(erros[0].property).toBe('email');
  });

  it('deve rejeitar senha curta (< 8 caracteres)', async () => {
    const dto = new CadastroDto();
    dto.nome = 'Aluno Teste';
    dto.email = 'aluno@email.com';
    dto.senha = 'senha1'; // 6 caracteres

    const erros = await validate(dto);
    expect(erros.length).toBeGreaterThan(0);
    expect(erros[0].property).toBe('senha');
  });

  it('deve rejeitar senha sem número', async () => {
    const dto = new CadastroDto();
    dto.nome = 'Aluno Teste';
    dto.email = 'aluno@email.com';
    dto.senha = 'senhaApenasTexto';

    const erros = await validate(dto);
    expect(erros.length).toBeGreaterThan(0);
    expect(erros[0].property).toBe('senha');
  });

  it('deve rejeitar senha com mais de 72 caracteres (prevenção DoS)', async () => {
    const dto = new CadastroDto();
    dto.nome = 'Aluno Teste';
    dto.email = 'aluno@email.com';
    dto.senha = 'a1'.repeat(37); // 74 caracteres

    const erros = await validate(dto);
    expect(erros.length).toBeGreaterThan(0);
    expect(erros[0].property).toBe('senha');
  });
});
