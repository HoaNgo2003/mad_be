import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity({ name: 'user_verify_account' })
export class UserVerifyAccount extends BaseMySqlEntity {
  @Column({ default: false })
  is_used: boolean;

  @Column()
  email: string;

  @Column()
  otp: string;

  @Column()
  expired_at: Date;

  @ManyToOne(() => User, (user) => user.active_account_otps, {
    onDelete: 'CASCADE',
  })
  user: User;
}
