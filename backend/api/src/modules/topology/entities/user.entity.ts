import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['organizationId'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['admin', 'operator', 'viewer'], default: 'viewer' })
  role: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.users, { nullable: true })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  lastLogin: Date;
}
