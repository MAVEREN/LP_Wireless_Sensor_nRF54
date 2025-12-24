import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('jobs')
@Index(['hubId'])
@Index(['status'])
@Index(['type'])
@Index(['createdAt'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: [
    'push_node_config',
    'pull_node_diagnostics',
    'trigger_node_maintenance',
    'update_hub_firmware',
    'export_support_package'
  ]})
  type: string;

  @Column({ nullable: true })
  hubId: string; // Target hub

  @Column({ nullable: true })
  nodeId: string; // Target node (if applicable)

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>; // Job-specific parameters

  @Column({ type: 'enum', enum: ['queued', 'running', 'succeeded', 'failed', 'timeout', 'cancelled'], default: 'queued' })
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'int', nullable: true })
  timeoutSeconds: number;

  @Column({ nullable: true })
  errorCode: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, any>; // Job result data

  @Column({ nullable: true })
  createdBy: string; // User ID or system

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
