import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { PostsComment } from 'src/modules/posts-comment/entities/posts-comment.entity';
import { PostsLike } from 'src/modules/posts-like/entities/posts-like.entity';
import { PostsShare } from 'src/modules/posts-share/entities/posts-share.entity';
import { User } from 'src/modules/user/entities/user.entity';

import { Entity, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
@Entity()
export class Posts extends BaseMySqlEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column('json')
  imageUrl: string[];

  @OneToMany(() => PostsLike, (postsLike) => postsLike.posts, {
    cascade: true,
    eager: true,
  })
  posts_like: PostsLike[];

  @OneToMany(() => PostsShare, (postsShare) => postsShare.posts, {
    cascade: true,
    eager: true,
  })
  posts_share: PostsShare[];

  @OneToMany(() => PostsComment, (postsComment) => postsComment.posts, {
    cascade: true,
    eager: true,
  })
  comments: PostsComment[];

  @ManyToOne(() => User, (user) => user.posts, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'post_user' })
  user: User;

  @Column({ default: 0 })
  ranking: number;
}
