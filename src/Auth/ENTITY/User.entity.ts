import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('USER')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'EMAIL', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'PASSWORD_HASH', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    name: 'ROLE',
    type: 'varchar',
    length: 20,
    default: 'user',
  })
  role: string;

  @Column({ name: 'IS_ACTIVE', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'CREATED_AT' })
  createdAt: Date;
}
