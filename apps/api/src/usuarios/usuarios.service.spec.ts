import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from './usuarios.service.js';
import { UsuariosRepository } from './usuarios.repository.js';
import { Usuario } from './models/usuario.entity.js';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let repositoryMock: UsuariosRepository;

  beforeEach(() => {
    repositoryMock = {
      buscarPorId: vi.fn(),
      buscarPorEmail: vi.fn(),
      criar: vi.fn(),
    } as unknown as UsuariosRepository;

    service = new UsuariosService(repositoryMock);
  });

  it('deve recusar cadastro com e-mail duplicado (ConflictException)', async () => {
    vi.spyOn(repositoryMock, 'buscarPorEmail').mockResolvedValue({
      id: 'uuid-existente',
      email: 'existente@email.com',
    } as Usuario);

    await expect(
      service.criar({
        nome: 'Usuario Teste',
        email: 'existente@email.com',
        senha: 'senhaSegura123',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve normalizar e-mail com letras maiúsculas para minúsculas', async () => {
    vi.spyOn(repositoryMock, 'buscarPorEmail').mockResolvedValue(null);
    const criarSpy = vi
      .spyOn(repositoryMock, 'criar')
      .mockImplementation(async (data) => {
        return {
          id: 'uuid-123',
          nome: data.nome!,
          email: data.email!,
          senha_hash: data.senha_hash!,
          plano: 'gratuito',
          creditos_disponiveis: 10,
          email_confirmado_em: null,
          criado_em: new Date(),
          atualizado_em: new Date(),
        } as Usuario;
      });

    const resposta = await service.criar({
      nome: 'Usuario Teste',
      email: '  TESTE.MAIUSCULO@EMAIL.COM  ',
      senha: 'senhaSegura123',
    });

    expect(repositoryMock.buscarPorEmail).toHaveBeenCalledWith(
      'teste.maiusculo@email.com',
    );
    expect(criarSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'teste.maiusculo@email.com',
      }),
    );
    expect(resposta.email).toBe('teste.maiusculo@email.com');
  });

  it('não deve conter a propriedade senha_hash no JSON retornado', async () => {
    vi.spyOn(repositoryMock, 'buscarPorEmail').mockResolvedValue(null);
    vi.spyOn(repositoryMock, 'criar').mockImplementation(async (data) => {
      return {
        id: 'uuid-123',
        nome: data.nome!,
        email: data.email!,
        senha_hash: data.senha_hash!,
        plano: 'gratuito',
        creditos_disponiveis: 10,
        email_confirmado_em: null,
        criado_em: new Date(),
        atualizado_em: new Date(),
      } as Usuario;
    });

    const resposta = await service.criar({
      nome: 'Usuario Teste',
      email: 'usuario@email.com',
      senha: 'senhaSegura123',
    });

    expect(resposta).not.toHaveProperty('senha_hash');
    expect((resposta as Record<string, unknown>).senha_hash).toBeUndefined();
  });

  it('deve salvar a senha como hash bcrypt em vez de texto puro', async () => {
    vi.spyOn(repositoryMock, 'buscarPorEmail').mockResolvedValue(null);
    let senhaHashSalva = '';
    vi.spyOn(repositoryMock, 'criar').mockImplementation(async (data) => {
      senhaHashSalva = data.senha_hash!;
      return {
        id: 'uuid-123',
        nome: data.nome!,
        email: data.email!,
        senha_hash: data.senha_hash!,
        plano: 'gratuito',
        creditos_disponiveis: 10,
        email_confirmado_em: null,
        criado_em: new Date(),
        atualizado_em: new Date(),
      } as Usuario;
    });

    await service.criar({
      nome: 'Usuario Teste',
      email: 'usuario@email.com',
      senha: 'minhaSenhaSegura123',
    });

    expect(senhaHashSalva).not.toBe('minhaSenhaSegura123');
    const eBcryptValido = await bcrypt.compare(
      'minhaSenhaSegura123',
      senhaHashSalva,
    );
    expect(eBcryptValido).toBe(true);
  });

  it('deve iniciar email_confirmado_em como nulo', async () => {
    vi.spyOn(repositoryMock, 'buscarPorEmail').mockResolvedValue(null);
    const criarSpy = vi
      .spyOn(repositoryMock, 'criar')
      .mockImplementation(async (data) => {
        return {
          id: 'uuid-123',
          nome: data.nome!,
          email: data.email!,
          senha_hash: data.senha_hash!,
          plano: 'gratuito',
          creditos_disponiveis: 10,
          email_confirmado_em: data.email_confirmado_em ?? null,
          criado_em: new Date(),
          atualizado_em: new Date(),
        } as Usuario;
      });

    const resposta = await service.criar({
      nome: 'Usuario Teste',
      email: 'usuario@email.com',
      senha: 'senhaSegura123',
    });

    expect(criarSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        email_confirmado_em: null,
      }),
    );
    expect(resposta.email_confirmado_em).toBeNull();
  });
});
