import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'notification' })
export class Notification extends BaseMySqlEntity {
  @Column()
  title: string;

  @Column()
  body: string;

  @Column()
  token: string;

  @Column({ default: false })
  seen: boolean;

  @ManyToOne(() => User, (user) => user.notifications, {
    cascade: true,
  })
  user: User;
}
