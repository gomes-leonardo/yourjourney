import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import { UsersRepository } from '../users/users.repository.js';
import { EmailService } from './email.service.js';
import { EmailConfirmationService } from '../email-confirmation/email-confirmation.service.js';
import { User } from '../users/models/user.entity.js';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepositoryMock: UsersRepository;
  let emailServiceMock: EmailService;
  let emailConfirmationServiceMock: EmailConfirmationService;

  beforeEach(() => {
    usersRepositoryMock = {
      findByEmail: vi.fn(),
      create: vi.fn(),
    } as unknown as UsersRepository;

    emailServiceMock = {
      sendConfirmationCode: vi.fn().mockResolvedValue(true),
    } as unknown as EmailService;

    emailConfirmationServiceMock = {
      issue: vi.fn().mockResolvedValue('123456'),
    } as unknown as EmailConfirmationService;

    service = new AuthService(
      usersRepositoryMock,
      emailServiceMock,
      emailConfirmationServiceMock,
    );
  });

  it('deve realizar cadastro válido com e-mail minúsculo, senha bcrypt e email_confirmed_at nulo', async () => {
    vi.spyOn(usersRepositoryMock, 'findByEmail').mockResolvedValue(null);

    let senhaHashSalva = '';
    const criarSpy = vi
      .spyOn(usersRepositoryMock, 'create')
      .mockImplementation(async (data) => {
        senhaHashSalva = data.password_hash!;
        return {
          id: 'uuid-aluno-1',
          name: data.name!,
          email: data.email!,
          password_hash: data.password_hash!,
          plan: 'gratuito',
          available_credits: 10,
          email_confirmed_at: data.email_confirmed_at,
          created_at: new Date(),
          updated_at: new Date(),
        } as User;
      });

    const resultado = await service.register({
      nome: '  Carlos Eduardo  ',
      email: '  CARLOS.EDUARDO@EMAIL.COM  ',
      senha: 'senhaSegura123',
    });

    expect(usersRepositoryMock.findByEmail).toHaveBeenCalledWith(
      'carlos.eduardo@email.com',
    );
    expect(criarSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Carlos Eduardo',
        email: 'carlos.eduardo@email.com',
        email_confirmed_at: null,
      }),
    );

    // Verifica que a senha foi criptografada com bcrypt
    const eBcrypt = await bcrypt.compare('senhaSegura123', senhaHashSalva);
    expect(eBcrypt).toBe(true);

    // Resposta sanitizada (sem password_hash e sem token JWT)
    expect(resultado.email).toBe('carlos.eduardo@email.com');
    expect(resultado).not.toHaveProperty('password_hash');
    expect(resultado).not.toHaveProperty('token');
    expect(resultado.email_confirmed_at).toBeNull();

    // E-mail disparado assincronamente
    expect(emailConfirmationServiceMock.issue).toHaveBeenCalledWith(
      'uuid-aluno-1',
    );
    expect(emailServiceMock.sendConfirmationCode).toHaveBeenCalledWith(
      'carlos.eduardo@email.com',
      '123456',
    );
  });

  it('deve recusar cadastro com e-mail duplicado (ConflictException / 409)', async () => {
    vi.spyOn(usersRepositoryMock, 'findByEmail').mockResolvedValue({
      id: 'uuid-existente',
      email: 'duplicado@email.com',
    } as User);

    await expect(
      service.register({
        nome: 'Novo Aluno',
        email: 'DUPLICADO@EMAIL.COM',
        senha: 'senhaSegura123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve concluir o cadastro com sucesso mesmo se o provedor de e-mail falhar/estiver fora do ar', async () => {
    vi.spyOn(usersRepositoryMock, 'findByEmail').mockResolvedValue(null);
    vi.spyOn(usersRepositoryMock, 'create').mockImplementation(async (data) => {
      return {
        id: 'uuid-aluno-2',
        name: data.name!,
        email: data.email!,
        password_hash: data.password_hash!,
        plan: 'gratuito',
        available_credits: 10,
        email_confirmed_at: null,
        created_at: new Date(),
        updated_at: new Date(),
      } as User;
    });

    // Simula provedor de e-mail rejeitando a promise / fora do ar
    vi.spyOn(emailServiceMock, 'sendConfirmationCode').mockRejectedValue(
      new Error('Provedor SMTP fora do ar'),
    );

    const resultado = await service.register({
      nome: 'Aluno Resiliente',
      email: 'resiliente@email.com',
      senha: 'senhaSegura123',
    });

    expect(resultado.id).toBe('uuid-aluno-2');
    expect(resultado.email).toBe('resiliente@email.com');
  });
});
