import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  /**
   * Busca um usuário pelo ID. Se não encontrar, lança exceção 404 (NotFoundException).
   */
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }
    return UserResponseDto.fromModel(user);
  }

  /**
   * Cadastra um novo usuário no sistema.
   * Regras:
   * 1. Normaliza o e-mail para letras minúsculas e sem espaços nas pontas.
   * 2. Recusa cadastro duplicado de e-mail (ConflictException 409).
   * 3. Gera hash seguro da password com bcrypt.
   * 4. Define `email_confirmado_em` como `null` até que a confirmação ocorra.
   */
  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const exists = await this.usersRepository.findByEmail(normalizedEmail);
    if (exists) {
      throw new ConflictException(
        'Já existe um usuário cadastrado com este e-mail.',
      );
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(dto.password, saltRounds);

    const newUser = await this.usersRepository.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      password_hash,
      email_confirmed_at: null,
    });

    return UserResponseDto.fromModel(newUser);
  }
}
