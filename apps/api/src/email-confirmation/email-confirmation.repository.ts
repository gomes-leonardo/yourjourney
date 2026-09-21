import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfirmationCode } from './models/email-confirmation-code.entity.js';

export interface RegisteredAttempt {
  id: string;
  codeHash: string;
  attempts: number;
}

export interface LatestCodeState {
  attempts: number;
  used: boolean;
  invalidated: boolean;
  expired: boolean;
}

@Injectable()
export class EmailConfirmationRepository {
  constructor(
    @InjectRepository(EmailConfirmationCode)
    private readonly repository: Repository<EmailConfirmationCode>,
  ) {}

  async replaceActive(
    userId: string,
    codeHash: string,
    ttlMinutes: number,
  ): Promise<void> {
    await this.repository.manager.transaction(async (manager) => {
      await manager.query('SELECT id FROM users WHERE id = $1 FOR UPDATE', [
        userId,
      ]);
      await manager.query(
        `UPDATE email_confirmation_codes
            SET invalidated_at = now()
          WHERE user_id = $1 AND used_at IS NULL AND invalidated_at IS NULL`,
        [userId],
      );
      await manager.query(
        `INSERT INTO email_confirmation_codes (user_id, code_hash, expires_at)
         VALUES ($1, $2, now() + make_interval(mins => $3))`,
        [userId, codeHash, ttlMinutes],
      );
    });
  }

  async registerAttempt(
    userId: string,
    maxAttempts: number,
  ): Promise<RegisteredAttempt | null> {
    const [rows] = (await this.repository.query(
      `UPDATE email_confirmation_codes
          SET attempts = attempts + 1
        WHERE user_id = $1
          AND used_at IS NULL
          AND invalidated_at IS NULL
          AND expires_at > now()
          AND attempts < $2
    RETURNING id, code_hash, attempts`,
      [userId, maxAttempts],
    )) as [{ id: string; code_hash: string; attempts: number }[], number];

    const row = rows[0];

    return row
      ? { id: row.id, codeHash: row.code_hash, attempts: row.attempts }
      : null;
  }

  async markUsed(id: string): Promise<boolean> {
    const [rows] = (await this.repository.query(
      `UPDATE email_confirmation_codes
          SET used_at = now()
        WHERE id = $1 AND used_at IS NULL AND invalidated_at IS NULL
    RETURNING id`,
      [id],
    )) as [{ id: string }[], number];

    return rows.length > 0;
  }

  async invalidate(id: string): Promise<void> {
    await this.repository.query(
      `UPDATE email_confirmation_codes
          SET invalidated_at = now()
        WHERE id = $1 AND used_at IS NULL AND invalidated_at IS NULL`,
      [id],
    );
  }

  async findLatestState(userId: string): Promise<LatestCodeState | null> {
    const rows = (await this.repository.query(
      `SELECT attempts,
              used_at IS NOT NULL AS used,
              invalidated_at IS NOT NULL AS invalidated,
              expires_at <= now() AS expired
         FROM email_confirmation_codes
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1`,
      [userId],
    )) as LatestCodeState[];

    return rows[0] ?? null;
  }
}
