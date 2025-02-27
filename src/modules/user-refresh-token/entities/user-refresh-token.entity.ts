import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'user_refresh_token' })
export class UserRefreshToken extends BaseMySqlEntity {
  @Column()
  token: string;

  @Column()
  is_used: string;

  @Column()
  expired_at: string;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  user: User;
}
