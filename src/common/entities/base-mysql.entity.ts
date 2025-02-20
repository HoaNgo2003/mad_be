import {
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity,
  DeleteDateColumn,
} from 'typeorm';
import dayjs from 'dayjs';

export abstract class BaseMySqlEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;

  get formattedCreatedAt(): string {
    return dayjs(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
  }

  get formattedUpdatedAt(): string {
    return dayjs(this.updatedAt).format('YYYY-MM-DD HH:mm:ss');
  }
}
