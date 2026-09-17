import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ENTIDADE (O "M" do padrão MVC)
 *
 * Representa a estrutura de uma tabela no banco de dados PostgreSQL.
 * Cada propriedade decorada com @Column vira uma coluna no banco.
 *
 * O que ESTE ARQUIVO DEVE FAZER:
 * - Definir os nomes de colunas, tipos de dados do banco, valores padrão e constraints (ex: unique).
 *
 * O que ESTE ARQUIVO NÃO DEVE FAZER:
 * - Não colocar decoradores de validação HTTP (como @IsEmail ou @IsNotEmpty do class-validator).
 *   Validação de requisição pertence aos DTOs!
 * - Não conter regras de negócio (pertencem ao Service).
 */
@Entity('users')
export class User {
  /** Chave primária (PK) gerada automaticamente como UUID v4. */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nome do usuário. */
  @Column()
  name: string;

  /** E-mail do usuário. Deve ser único no banco de dados. */
  @Column({ unique: true })
  email: string;

  /** Hash da password para autenticação (nunca armazene senhas em texto puro). */
  @Column()
  password_hash: string;

  /** Plano do usuário (ex: 'gratuito', 'pro'). Padrão: 'gratuito'. */
  @Column({ default: 'gratuito' })
  plan: string;

  /** Saldo de créditos de processamento de materiais. Padrão: 10. */
  @Column({ default: 10 })
  available_credits: number;

  /** Data e hora em que o e-mail foi confirmado (nulo enquanto não confirmar). */
  // O tipo precisa ser explícito. Com `Date | null`, o TypeScript reflete a
  // união como `Object`, e o TypeORM não consegue descobrir o tipo da coluna:
  // DataTypeNotSupportedError: Data type "Object" ... is not supported.
  @Column({ type: 'timestamp', nullable: true })
  email_confirmed_at: Date | null;

  /** Preenchido automaticamente pelo TypeORM no momento da inserção. */
  @CreateDateColumn()
  created_at: Date;

  /** Atualizado automaticamente pelo TypeORM sempre que o registro for alterado. */
  @UpdateDateColumn()
  updated_at: Date;
}
