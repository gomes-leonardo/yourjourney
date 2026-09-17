import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';

@Module({
  imports: [ConfigModule, DatabaseModule, HealthModule, UsuariosModule],
})
export class AppModule {}

