import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Posts } from 'src/modules/posts/entities/posts.entity';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
@Entity()
export class PostsShare extends BaseMySqlEntity {
  @Column()
  user_id: string;

  @ManyToOne(() => Posts, (posts) => posts.posts_share, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'posts_share_id' })
  posts: Posts;
}
