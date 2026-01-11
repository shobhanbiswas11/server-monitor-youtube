import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LogSourceType {
  ZABBIX = 'zabbix',
  PROMETHEUS = 'prometheus',
}

export enum LogSourceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  UNKNOWN = 'unknown',
}

@Entity()
export class LogSource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  status: LogSourceStatus;

  @Column()
  type: LogSourceType;

  @Column({ type: 'simple-json' })
  config: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
