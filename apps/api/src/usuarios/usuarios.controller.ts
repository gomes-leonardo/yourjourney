import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto.js';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /** POST /usuarios - Cadastra um novo usuário no sistema. Devolve 201 Created. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async criar(@Body() dto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
    return this.usuariosService.criar(dto);
  }

  /** GET /usuarios/:id - Busca um usuário específico pelo ID (UUID). */
  @Get(':id')
  async buscarPorId(@Param('id') id: string): Promise<UsuarioRespostaDto> {
    return this.usuariosService.buscarPorId(id);
  }
}
