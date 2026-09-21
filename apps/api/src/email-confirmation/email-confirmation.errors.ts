import { HttpException, HttpStatus } from '@nestjs/common';

class ConfirmationCodeException extends HttpException {
  constructor(code: string, message: string, status: HttpStatus) {
    super({ code, message }, status);
  }
}

export class IncorrectConfirmationCodeException extends ConfirmationCodeException {
  constructor() {
    super(
      'CONFIRMATION_CODE_INCORRECT',
      'Código de confirmação incorreto.',
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ExpiredConfirmationCodeException extends ConfirmationCodeException {
  constructor() {
    super(
      'CONFIRMATION_CODE_EXPIRED',
      'O código de confirmação expirou. Peça um novo.',
      HttpStatus.GONE,
    );
  }
}

export class ConfirmationCodeAttemptsExceededException extends ConfirmationCodeException {
  constructor() {
    super(
      'CONFIRMATION_CODE_ATTEMPTS_EXCEEDED',
      'Número máximo de tentativas atingido. Peça um novo código.',
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

export class ConfirmationCodeAlreadyUsedException extends ConfirmationCodeException {
  constructor() {
    super(
      'CONFIRMATION_CODE_ALREADY_USED',
      'Este código de confirmação já foi usado.',
      HttpStatus.CONFLICT,
    );
  }
}

export class ConfirmationCodeNotFoundException extends ConfirmationCodeException {
  constructor() {
    super(
      'CONFIRMATION_CODE_NOT_FOUND',
      'Não há código de confirmação ativo. Peça um novo.',
      HttpStatus.NOT_FOUND,
    );
  }
}
