import { Exclude } from 'class-transformer';
import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { UserRefreshToken } from 'src/modules/user-refresh-token/entities/user-refresh-token.entity';
import { UserVerifyAccount } from 'src/modules/user-verify-account/entities/user-verify-account.entity';
import { Entity, Column, OneToMany } from 'typeorm';
@Entity()
export class User extends BaseMySqlEntity {
  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  email: string;

  @Column({ default: '' })
  profile_picture: string;

  @OneToMany(() => UserRefreshToken, (token) => token.user)
  tokens: UserRefreshToken[];

  @OneToMany(() => UserVerifyAccount, (otp) => otp.user)
  active_account_otps: UserVerifyAccount[];

  @Column({ default: false })
  status: boolean;
}
