import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { CurrentUserModule } from './current-user/current-user.module.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './health/health.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule,
    CurrentUserModule,
    DatabaseModule,
    HealthModule,
    UsersModule,
  ],
})
export class AppModule {}
