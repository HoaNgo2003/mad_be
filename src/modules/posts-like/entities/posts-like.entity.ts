import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { EReact } from 'src/common/types/data-type';
import { Posts } from 'src/modules/posts/entities/posts.entity';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
@Entity()
export class PostsLike extends BaseMySqlEntity {
  @Column()
  user_id: string;

  @Column()
  type: EReact;

  @ManyToOne(() => Posts, (posts) => posts.posts_like, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'posts_like_id' })
  posts: Posts;
}
