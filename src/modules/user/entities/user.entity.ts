import { Exclude } from 'class-transformer';
import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { PlantSearchHistory } from 'src/modules/plant-search-history/entities/plant-search-history.entity';
import { PlantWishList } from 'src/modules/plant-wishlist/entities/plant-wishlist.entity';
import { PostsComment } from 'src/modules/posts-comment/entities/posts-comment.entity';
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

  @Column({ default: null })
  token_device: string;

  @Column({ default: null })
  full_name: string;

  @Column({ default: null })
  gender: string;

  @Column({ default: null })
  birth_day: string;

  @Column({ default: '' })
  profile_picture: string;

  @OneToMany(() => UserRefreshToken, (token) => token.user)
  tokens: UserRefreshToken[];

  @OneToMany(() => UserVerifyAccount, (otp) => otp.user)
  active_account_otps: UserVerifyAccount[];

  @Column({ default: false })
  status: boolean;

  @OneToMany(() => PlantWishList, (wishlist) => wishlist.user)
  plant_wishlist: PlantWishList[];

  @OneToMany(() => PlantSearchHistory, (history) => history.user)
  plant_search_histories: PlantSearchHistory[];

  @OneToMany(() => PostsComment, (comment) => comment.user)
  comments: PostsComment[];
}
