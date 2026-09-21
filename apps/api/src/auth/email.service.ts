import { Injectable, Logger } from '@nestjs/common';
import { randomInt } from 'node:crypto';

/**
 * SERVIÇO DE E-MAIL E CÓDIGO DE CONFIRMAÇÃO
 *
 * Responsável por gerar códigos de confirmação criptográficos e disparar e-mails.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  /**
   * Gera um código numérico aleatório de 6 dígitos (100000 - 999999).
   * Usa `crypto.randomInt` nativo do Node.js para garantir entropia criptográfica real.
   */
  generateConfirmationCode(): string {
    return randomInt(100000, 1000000).toString();
  }

  /**
   * Dispara o e-mail de confirmação de cadastro com o código de 6 dígitos.
   *
   * NOTA DE SEGURANÇA E PERFORMANCE:
   * Esta operação deve ser chamada sem bloquear a resposta HTTP (`non-blocking`).
   * Se o provedor de e-mail estiver fora do ar ou lento, o cadastro do usuário
   * NÃO é cancelado nem atrasado.
   */
  async sendConfirmationCode(email: string, codigo: string): Promise<boolean> {
    try {
      this.logger.log(
        `Disparando e-mail de confirmação para ${email} com o código [${codigo}]`,
      );

      // Simulação do tempo de envio do provedor SMTP/API externa
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
