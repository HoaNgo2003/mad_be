import { BaseMySqlEntity } from "src/common/entities/base-mysql.entity";
import { User } from "src/modules/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity('search_histories')
export class SearchHistory extends BaseMySqlEntity {
  @Column('text')
  keyword: string;

  @Column('int', { default: 1 })
  search_count: number;

  @ManyToOne(() => User, user => user.search_histories, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}