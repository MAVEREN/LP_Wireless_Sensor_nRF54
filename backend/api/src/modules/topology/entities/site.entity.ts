import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Organization } from './organization.entity';
import { Machine } from './machine.entity';
import { Hub } from './hub.entity';

@Entity('sites')
@Index(['organizationId'])
@Index(['name'])
export class Site {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column()
  organizationId: string;

  @ManyToOne(() => Organization, (org) => org.sites)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @OneToMany(() => Machine, (machine) => machine.site)
  machines: Machine[];

  @OneToMany(() => Hub, (hub) => hub.site)
  hubs: Hub[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
