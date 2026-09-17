import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { CriarUsuarioDto } from './dto/criar-usuario.dto.js';
import { UsuarioRespostaDto } from './dto/usuario-resposta.dto.js';
import { Usuario } from './models/usuario.entity.js';

/**
 * CONTROLLER (Camada de Entrada HTTP)
 *
 * Mapeia as rotas REST HTTP para ações do sistema.
 *
 * O que ESTE ARQUIVO DEVE FAZER:
 * - Receber as requisições HTTP na rota `/usuarios`.
 * - Extrair parâmetros da URL (`@Param()`) e corpo da requisição (`@Body()`).
 * - Chamar os métodos do `UsuariosService` e retornar a resposta ao cliente.
 * - Definir os códigos de status HTTP apropriados (`200 OK`, `201 Created`, `204 No Content`).
 *
 * O que ESTE ARQUIVO NÃO DEVE FAZER:
 * - Não deve conter regras de negócio (um `if` de negócio aqui está no lugar errado e pertence ao Service).
 * - Não deve acessar o banco de dados diretamente.
 */
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /** GET /usuarios - Lista todos os usuários. */
  @Get()
  async buscarTodos(): Promise<UsuarioRespostaDto[]> {
    return this.usuariosService.buscarTodos();
  }

  /** GET /usuarios/:id - Busca um usuário específico pelo ID (UUID). */
  @Get(':id')
  async buscarPorId(@Param('id') id: string): Promise<UsuarioRespostaDto> {
    return this.usuariosService.buscarPorId(id);
  }

  /** POST /usuarios - Cadastra um novo usuário no sistema. Devolve 201 Created. */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async criar(@Body() dto: CriarUsuarioDto): Promise<UsuarioRespostaDto> {
    return this.usuariosService.criar(dto);
  }

  /** PATCH /usuarios/:id - Atualiza parcialmente os dados do usuário. */
  @Patch(':id')
  async atualizar(
    @Param('id') id: string,
    @Body() body: Partial<Usuario>,
  ): Promise<void> {
    return this.usuariosService.atualizar(id, body);
  }

  /** DELETE /usuarios/:id - Deleta um usuário pelo ID. Devolve 204 No Content. */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletar(@Param('id') id: string): Promise<void> {
    return this.usuariosService.deletar(id);
  }
}
