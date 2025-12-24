import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { Site } from './site.entity';
import { Node } from './node.entity';

@Entity('machines')
@Index(['siteId'])
@Index(['name'])
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  assetTag: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column()
  siteId: string;

  @ManyToOne(() => Site, (site) => site.machines)
  @JoinColumn({ name: 'siteId' })
  site: Site;

  @OneToMany(() => Node, (node) => node.machine)
  nodes: Node[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
