import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Posts } from 'src/modules/posts/entities/posts.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('comments')
export class PostsComment extends BaseMySqlEntity {
  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Posts, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  posts: Posts;

  @ManyToOne(() => PostsComment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: PostsComment;

  @OneToMany(() => PostsComment, (comment) => comment.parent)
  replies: PostsComment[];
}
