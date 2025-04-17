import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { ETypeNoti } from 'src/common/types/data-type';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'notification' })
export class Notification extends BaseMySqlEntity {
  @Column()
  title: string;

  @Column({ type: 'json' })
  body: string;

  @Column({ nullable: true })
  token: string;

  @Column({ nullable: true })
  type: string;

  @Column({ default: false })
  seen: boolean;

  @ManyToOne(() => User, (user) => user.notifications, {
    cascade: true,
  })
  user: User;
}
