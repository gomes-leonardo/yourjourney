import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AppConfigService } from '../config/app-config.service.js';
import { generateConfirmationCode } from './confirmation-code.js';
import { EmailConfirmationRepository } from './email-confirmation.repository.js';
import {
  ConfirmationCodeAlreadyUsedException,
  ConfirmationCodeAttemptsExceededException,
  ConfirmationCodeNotFoundException,
  ExpiredConfirmationCodeException,
  IncorrectConfirmationCodeException,
} from './email-confirmation.errors.js';

const SALT_ROUNDS = 10;

@Injectable()
export class EmailConfirmationService {
  constructor(
    private readonly repository: EmailConfirmationRepository,
    private readonly config: AppConfigService,
  ) {}

  async issue(userId: string): Promise<string> {
    const code = generateConfirmationCode();
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);

    await this.repository.replaceActive(
      userId,
      codeHash,
      this.config.confirmationCodeTtlMinutes,
    );

    return code;
  }

  async verify(userId: string, code: string): Promise<void> {
    const maxAttempts = this.config.confirmationCodeMaxAttempts;
    const attempt = await this.repository.registerAttempt(userId, maxAttempts);

    if (!attempt) {
      throw await this.reasonWhyNotActive(userId, maxAttempts);
    }

    const matches = await bcrypt.compare(code, attempt.codeHash);

    if (!matches) {
      if (attempt.attempts >= maxAttempts) {
        await this.repository.invalidate(attempt.id);
        throw new ConfirmationCodeAttemptsExceededException();
      }

      throw new IncorrectConfirmationCodeException();
    }

    const marked = await this.repository.markUsed(attempt.id);

    if (!marked) {
      throw new ConfirmationCodeAlreadyUsedException();
    }
  }

  private async reasonWhyNotActive(
    userId: string,
    maxAttempts: number,
  ): Promise<Error> {
    const latest = await this.repository.findLatestState(userId);

    if (!latest) return new ConfirmationCodeNotFoundException();
    if (latest.used) return new ConfirmationCodeAlreadyUsedException();
    if (latest.invalidated || latest.attempts >= maxAttempts) {
      return new ConfirmationCodeAttemptsExceededException();
    }
    if (latest.expired) return new ExpiredConfirmationCodeException();

    return new ConfirmationCodeNotFoundException();
  }
}
