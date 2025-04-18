import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Plant } from 'src/modules/plant/entities/plant.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class PlantSearchHistory extends BaseMySqlEntity {
  @Column()
  keyword: string;

  @Column({ default: null })
  plant_google_name: string;

  @Column({ default: null })
  plant_url: string;

  @ManyToOne(() => User, (user) => user.plant_search_histories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_history' })
  user: User;

  @ManyToOne(() => Plant, (plant) => plant.plant_search_histories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'plant_history' })
  plant: Plant;
}
