import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailConfirmationRepository } from './email-confirmation.repository.js';
import { EmailConfirmationService } from './email-confirmation.service.js';
import { EmailConfirmationCode } from './models/email-confirmation-code.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([EmailConfirmationCode])],
  providers: [EmailConfirmationRepository, EmailConfirmationService],
  exports: [EmailConfirmationService],
})
export class EmailConfirmationModule {}
