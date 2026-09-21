import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service.js';
import { UsersRepository } from './users.repository.js';
import { User } from './models/user.entity.js';

describe('UsuariosService', () => {
  let service: UsersService;
  let repositoryMock: UsersRepository;

  beforeEach(() => {
    repositoryMock = {
      findById: vi.fn(),
      findByEmail: vi.fn(),
      create: vi.fn(),
    } as unknown as UsersRepository;

    service = new UsersService(repositoryMock);
  });

  it('deve recusar cadastro com e-mail duplicado (ConflictException)', async () => {
    vi.spyOn(repositoryMock, 'findByEmail').mockResolvedValue({
      id: 'uuid-existente',
      email: 'existente@email.com',
    } as User);

    await expect(
      service.create({
        name: 'Usuario Teste',
        email: 'existente@email.com',
        password: 'senhaSegura123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve normalizar e-mail com letras maiúsculas para minúsculas', async () => {
    vi.spyOn(repositoryMock, 'findByEmail').mockResolvedValue(null);
    const criarSpy = vi
      .spyOn(repositoryMock, 'create')
      .mockImplementation(async (data) => {
        return {
          id: 'uuid-123',
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

    const resposta = await service.create({
      name: 'Usuario Teste',
      email: '  TESTE.MAIUSCULO@EMAIL.COM  ',
      password: 'senhaSegura123',
    });

    expect(repositoryMock.findByEmail).toHaveBeenCalledWith(
      'teste.maiusculo@email.com',
    );
    expect(criarSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'teste.maiusculo@email.com',
      }),
    );
    expect(resposta.email).toBe('teste.maiusculo@email.com');
  });

  it('não deve conter a propriedade password_hash no JSON retornado', async () => {
    vi.spyOn(repositoryMock, 'findByEmail').mockResolvedValue(null);
    vi.spyOn(repositoryMock, 'create').mockImplementation(async (data) => {
      return {
        id: 'uuid-123',
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

    const resposta = await service.create({
      name: 'Usuario Teste',
      email: 'usuario@email.com',
      password: 'senhaSegura123',
    });

    expect(resposta).not.toHaveProperty('password_hash');
    expect((resposta as Record<string, unknown>).password_hash).toBeUndefined();
  });

  it('deve salvar a senha como hash bcrypt em vez de texto puro', async () => {
    vi.spyOn(repositoryMock, 'findByEmail').mockResolvedValue(null);
    let senhaHashSalva = '';
    vi.spyOn(repositoryMock, 'create').mockImplementation(async (data) => {
      senhaHashSalva = data.password_hash!;
      return {
        id: 'uuid-123',
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

    await service.create({
      name: 'Usuario Teste',
      email: 'usuario@email.com',
      password: 'minhaSenhaSegura123',
    });

    expect(senhaHashSalva).not.toBe('minhaSenhaSegura123');
    const eBcryptValido = await bcrypt.compare(
      'minhaSenhaSegura123',
      senhaHashSalva,
    );
    expect(eBcryptValido).toBe(true);
  });

  it('deve iniciar email_confirmado_em como nulo', async () => {
    vi.spyOn(repositoryMock, 'findByEmail').mockResolvedValue(null);
    const criarSpy = vi
      .spyOn(repositoryMock, 'create')
      .mockImplementation(async (data) => {
        return {
          id: 'uuid-123',
          name: data.name!,
          email: data.email!,
          password_hash: data.password_hash!,
          plan: 'gratuito',
          available_credits: 10,
          email_confirmed_at: data.email_confirmed_at ?? null,
          created_at: new Date(),
          updated_at: new Date(),
        } as User;
      });

    const resposta = await service.create({
      name: 'Usuario Teste',
      email: 'usuario@email.com',
      password: 'senhaSegura123',
    });

    expect(criarSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email_confirmed_at: null,
      }),
    );
    expect(resposta.email_confirmed_at).toBeNull();
  });
});
