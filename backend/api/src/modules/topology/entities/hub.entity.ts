import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Site } from './site.entity';
import { Node } from './node.entity';

@Entity('hubs')
@Index(['deviceId'], { unique: true })
@Index(['siteId'])
export class Hub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  deviceId: string; // Azure IoT Hub device ID

  @Column({ nullable: true })
  macAddress: string;

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ nullable: true })
  firmwareVersion: string;

  @Column({ nullable: true })
  hardwareRevision: string;

  @Column({ type: 'enum', enum: ['provisioning', 'connected', 'disconnected', 'error'], default: 'provisioning' })
  status: string;

  @Column({ type: 'timestamptz', nullable: true })
  lastSeen: Date;

  @Column({ type: 'jsonb', nullable: true })
  deviceTwinDesired: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  deviceTwinReported: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  siteId: string;

  @ManyToOne(() => Site, (site) => site.hubs, { nullable: true })
  @JoinColumn({ name: 'siteId' })
  site: Site;

  @OneToMany(() => Node, (node) => node.hub)
  nodes: Node[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
