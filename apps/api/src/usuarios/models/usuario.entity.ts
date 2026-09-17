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
@Entity('usuarios')
export class Usuario {
  /** Chave primária (PK) gerada automaticamente como UUID v4. */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Nome do usuário. */
  @Column()
  nome: string;

  /** E-mail do usuário. Deve ser único no banco de dados. */
  @Column({ unique: true })
  email: string;

  /** Hash da senha para autenticação (nunca armazene senhas em texto puro). */
  @Column()
  senha_hash: string;

  /** Plano do usuário (ex: 'gratuito', 'pro'). Padrão: 'gratuito'. */
  @Column({ default: 'gratuito' })
  plano: string;

  /** Saldo de créditos de processamento de materiais. Padrão: 10. */
  @Column({ default: 10 })
  creditos_disponiveis: number;

  /** Data e hora em que o e-mail foi confirmado (nulo enquanto não confirmar). */
  @Column({ nullable: true })
  email_confirmado_em: Date;

  /** Preenchido automaticamente pelo TypeORM no momento da inserção. */
  @CreateDateColumn()
  criado_em: Date;

  /** Atualizado automaticamente pelo TypeORM sempre que o registro for alterado. */
  @UpdateDateColumn()
  atualizado_em: Date;
}
