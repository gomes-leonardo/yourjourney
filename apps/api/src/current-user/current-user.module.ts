import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service.js';
import { createCurrentUserProvider } from './create-current-user-provider.js';
import { CurrentUserGuard } from './current-user.guard.js';
import { CurrentUserProvider } from './current-user.provider.js';

@Module({
  providers: [
    {
      provide: CurrentUserProvider,
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) =>
        createCurrentUserProvider(config.isProduction),
    },
    CurrentUserGuard,
  ],
  exports: [CurrentUserProvider, CurrentUserGuard],
})
export class CurrentUserModule {}
