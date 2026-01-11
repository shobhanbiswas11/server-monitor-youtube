import { LogSource } from '@/log-sources/entities/log-source.entity';
import { RemoteServer } from '@/remote-servers/entities/remote-server.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Anomaly } from './anomaly.entity';

export enum LogAnalysisJobStatus {
  INITIALIZED = 'initialized',
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum LogAnalysisJobType {
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
}

@Entity()
export class LogAnalysisJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  status: LogAnalysisJobStatus;

  @Column()
  type: LogAnalysisJobType;

  @Column({ type: 'simple-json', nullable: true })
  ticketingSystemConfig?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => LogSource, { nullable: true })
  @JoinColumn()
  logSource?: LogSource;

  @OneToOne(() => RemoteServer)
  @JoinColumn()
  remoteServer: RemoteServer;

  @OneToMany(() => Anomaly, (anomaly) => anomaly.logAnalysisJob)
  anomalies: Anomaly[];
}
