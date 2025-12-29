import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { SensorGroup } from './sensor-group.entity';
import { Hub } from './hub.entity';

@Entity('nodes')
@Index(['nodeId'], { unique: true })
@Index(['sensorGroupId'])
@Index(['hubId'])
export class Node {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nodeId: string; // MAC address or unique identifier

  @Column({ nullable: true })
  serialNumber: string;

  @Column({ nullable: true })
  firmwareVersion: string;

  @Column({ nullable: true })
  hardwareRevision: string;

  @Column({ type: 'enum', enum: ['uncommissioned', 'operational', 'maintenance', 'fault', 'offline'], default: 'uncommissioned' })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  configuration: Record<string, any>; // Node config per schema

  @Column({ type: 'jsonb', nullable: true })
  calibration: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  lastReading: {
    timestamp: Date;
    value: number;
    unit: string;
    quality: number;
  };

  @Column({ type: 'int', nullable: true })
  batteryPercent: number;

  @Column({ type: 'int', nullable: true })
  batteryMillivolts: number;

  @Column({ type: 'jsonb', nullable: true })
  faults: string[];

  @Column({ type: 'int', nullable: true })
  rssi: number; // Signal strength to hub

  @Column({ type: 'timestamptz', nullable: true })
  lastSeen: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  sensorGroupId: string;

  @ManyToOne(() => SensorGroup, (sensorGroup) => sensorGroup.nodes, { nullable: true })
  @JoinColumn({ name: 'sensorGroupId' })
  sensorGroup: SensorGroup;

  @Column({ nullable: true })
  hubId: string;

  @ManyToOne(() => Hub, (hub) => hub.nodes, { nullable: true })
  @JoinColumn({ name: 'hubId' })
  hub: Hub;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
