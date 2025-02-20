import { Exclude } from 'class-transformer';
import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Column } from 'typeorm';

export class User extends BaseMySqlEntity {
  @Column()
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  username: string;

  @Column()
  profileUrl: string;

  @Column()
  active: boolean;
}
