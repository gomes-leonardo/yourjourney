import { Injectable, Logger } from '@nestjs/common';

/**
 * SERVIÇO DE E-MAIL
 *
 * Responsável por disparar e-mails. A geração do código de confirmação fica
 * em `EmailConfirmationService`.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Dispara o e-mail de confirmação de cadastro com o código de 6 dígitos.
   *
   * NOTA DE SEGURANÇA E PERFORMANCE:
   * Esta operação deve ser chamada sem bloquear a resposta HTTP (`non-blocking`).
   * Se o provedor de e-mail estiver fora do ar ou lento, o cadastro do usuário
   * NÃO é cancelado nem atrasado.
   */
  async sendConfirmationCode(email: string, _codigo: string): Promise<boolean> {
    try {
      this.logger.log(`Disparando e-mail de confirmação para ${email}`);

      // Simulação do envio: o código iria no corpo do e-mail, nunca no log
      await new Promise((resolve) => setTimeout(resolve, 50));

      return true;
    } catch (erro) {
      // Falha no envio é registrada em log sanitizado, sem expor credenciais ou estourar exceção para a rota
      this.logger.error(
        `Falha ao enviar e-mail de confirmação para ${email}:`,
        erro,
      );
      return false;
    }
  }
}
