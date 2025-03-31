import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('schedule_rules')
export class ScheduleRule extends BaseMySqlEntity{

  @Column()
  user_id: number;

  @Column()
  plant_id: number;

  @Column()
  task_name: string;

  @Column({ type: 'int' }) // Bao nhiêu ngày một lần
  repeat_interval: number;

  @Column({ type: 'time' })
  time_of_day: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;
}
