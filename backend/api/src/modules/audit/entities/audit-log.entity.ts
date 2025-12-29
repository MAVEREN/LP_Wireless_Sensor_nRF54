import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['resourceType'])
@Index(['resourceId'])
@Index(['timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string; // User who performed the action

  @Column()
  action: string; // CREATE, UPDATE, DELETE, etc.

  @Column()
  resourceType: string; // organization, site, sensor_group, node, hub, job, etc.

  @Column()
  resourceId: string; // ID of the affected resource

  @Column({ type: 'jsonb', nullable: true })
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ type: 'text', nullable: true })
  reason: string; // User-provided reason for change

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;
}
