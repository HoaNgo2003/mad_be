import { BaseMySqlEntity } from 'src/common/entities/base-mysql.entity';
import { Plant } from 'src/modules/plant/entities/plant.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class PlantWishList extends BaseMySqlEntity {
  @ManyToOne(() => User, (user) => user.plant_wishlist, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wishlist_id' })
  user: User;

  @ManyToOne(() => Plant, (plant) => plant.plant_wishlist, {
    cascade: false,
    eager: true,
  })
  @JoinColumn({ name: 'wishlist_plan_id' })
  plant: Plant;
}
