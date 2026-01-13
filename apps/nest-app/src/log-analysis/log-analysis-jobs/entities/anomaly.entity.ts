import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LogAnalysisJob } from './log-analysis-job.entity';

export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AnomalyStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed',
}

@Entity()
export class Anomaly {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: AnomalyStatus;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  severity: AnomalySeverity;

  @Column({ type: 'simple-json', nullable: true })
  ticketInfo?: Record<string, any>;

  @ManyToOne(
    () => LogAnalysisJob,
    (logAnalysisJob) => logAnalysisJob.anomalies,
    {
      onDelete: 'CASCADE',
    },
  )
  logAnalysisJob: LogAnalysisJob;
}
