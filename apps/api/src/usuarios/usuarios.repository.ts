import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './models/usuario.entity.js';

@Injectable()
export class UsuariosRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { email },
    });
  }

  async criar(data: Partial<Usuario>): Promise<Usuario> {
    const usuario = this.repository.create(data);
    return this.repository.save(usuario);
  }
}
